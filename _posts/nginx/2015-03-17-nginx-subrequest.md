---
title: subrequest原理解析
category: Nginx
---

子请求并不是http标准里面的概念，它是在当前请求中发起的一个新的请求，它拥有自己的ngx_http_request_t结构，uri和args。一般来说使用subrequest的效率可能会有些影响，因为它需要重新从server rewrite开始走一遍request处理的PHASE，但是它在某些情况下使用能带来方便，比较常用的是用subrequest来访问一个upstream的后端，并给它一个ngx_http_post_subrequest_t的回调handler，这样有点类似于一个异步的函数调用。对于从upstream返回的数据，subrequest允许根据创建时指定的flag，来决定由用户自己处理(回调handler中)还是由upstream模块直接发送到output filter。

简单的说一下subrequest的行为，nginx使用subrequest访问某个location，产生相应的数据，并插入到nginx输出链的相应位置（创建subrequest时的位置）。下面用nginx代码内的addition模块(默认未编译进nginx核心，请使用–with-http_addition_module选项包含此模块)来举例说明一下：

    location /main.htm {
        # content of main.htm: main
        add_before_body /hello.htm;
        add_after_body /world.htm;
    }
    location /hello.htm {
        #content of hello.htm: hello
    }
    location /world.htm {
        #content of world.htm: world
    }

访问/main.htm，将得到如下响应：

    hello
    main
    world

上面的add_before_body指令发起一个subrequest来访问/hello.htm，并将产生的内容(hello)插入主请求响应体的开头，add_after_body指令发起一个subrequest访问/world.htm，并将产生的内容(world)附加在主请求响应体的结尾。addition模块是一个filter模块，但是subrequest既可以在phase模块中使用，也可以在filter模块中使用。

---

在进行源码解析之前，先来想想如果是我们自己要实现subrequest的上述行为，该如何来做？

subrequest还可能有自己的subrequest，而且每个subrequest都不一定按照其创建的顺序来输出数据，所以简单的采用链表不好实现，于是进一步联想到可以采用树的结构来做，主请求即为根节点，每个节点可以有自己的子节点，遍历某节点表示处理某请求，自然的可以想到这里可能是用后根(序)遍历的方法，没错，实际上Igor采用`树和链表结合`的方式实现了subrequest的功能，但是由于节点（请求）产生数据的顺序不是固定按节点创建顺序(左->右)，而且可能分多次产生数据，不能简单的用后根(序)遍历。Igor使用了`2个链表`的结构来实现。

第一个是每个请求都有的`postponed链表`，一般情况下每个链表节点保存了该请求的一个子请求，该链表节点定义如下：

```c
struct ngx_http_postponed_request_s {
    ngx_http_request_t               *request; // 子请求
    ngx_chain_t                      *out;     // 产生的数据
    ngx_http_postponed_request_t     *next;
};
```

可以看到它有一个request字段，可以用来保存子请求，另外还有一个ngx_chain_t类型的out字段，实际上一个请求的postponed链表里面除了保存子请求的节点，还有保存该请求自己产生的数据的节点，数据保存在out字段。

第二个是`posted_requests链表`，它挂载了当前需要遍历的请求（节点）， 该链表保存在主请求（根节点）的posted_requests字段，链表节点定义如下：

```c
struct ngx_http_posted_request_s {
    ngx_http_request_t               *request; // 子请求
    ngx_http_posted_request_t        *next;
};
```

在`ngx_http_run_posted_requests函数`中会顺序的遍历主请求的posted_requests链表：

```c
void
ngx_http_run_posted_requests(ngx_connection_t *c)
{
    ...
    for ( ;; ) {
        /* 连接已经断开，直接返回 */
        if (c->destroyed) {
            return;
        }

        r = c->data;
        /* 从posted_requests链表的队头开始遍历 */
        pr = r->main->posted_requests;

        if (pr == NULL) {
            return;
        }


        /* 从链表中移除即将要遍历的节点 */
        r->main->posted_requests = pr->next;
        /* 得到该节点中保存的请求 */
        r = pr->request;

        ctx = c->log->data;
        ctx->current_request = r;

        ngx_log_debug2(NGX_LOG_DEBUG_HTTP, c->log, 0,
                       "http posted request: \"%V?%V\"", &r->uri, &r->args);
        /* 遍历该节点（请求） */
        r->write_event_handler(r);
    }
}

```

ngx_http_run_posted_requests函数的调用点后面会做说明。

---

了解了一些实现的原理，来看代码就简单多了，现在正式进行subrequest的源码解析。

首先来看一下创建subrequest的函数定义：

```c
ngx_int_t
ngx_http_subrequest(ngx_http_request_t *r,
    ngx_str_t *uri, ngx_str_t *args, ngx_http_request_t **psr,
    ngx_http_post_subrequest_t *ps, ngx_uint_t flags)
```

参数r为当前的请求，uri和args为新的要发起的uri和args，当然args可以为NULL。

`psr`为指向一个ngx_http_request_t指针的指针，它的作用就是获得创建的子请求。

`ps`的类型为ngx_http_post_subrequest_t，它的定义如下：

```c
typedef struct {
    ngx_http_post_subrequest_pt       handler;
    void                             *data;
} ngx_http_post_subrequest_t;

typedef ngx_int_t (*ngx_http_post_subrequest_pt)(ngx_http_request_t *r,
    void *data, ngx_int_t rc);
```

它就是之前说到的回调handler，结构里面的handler类型为ngx_http_post_subrequest_pt，它是函数指针，data为传递给handler的额外参数。

再来看一下ngx_http_subrequest函数的最后一个参数是flags，现在的源码中实际上只有2种类型的flag，分别为`NGX_HTTP_SUBREQUEST_IN_MEMORY`和`NGX_HTTP_SUBREQUEST_WAITED`，第一个就是指定文章开头说到的子请求的upstream处理数据的方式，第二个参数表示如果该子请求提前完成(按后续遍历的顺序)，是否设置将它的状态设为done。当设置该参数时，提前完成就会设置done；不设时，会让该子请求等待它之前的子请求处理完毕才会将状态设置为done。

进入`ngx_http_subrequest函数`内部看看：

```c
{
    ...
    /* 解析flags， subrequest_in_memory在upstream模块解析完头部，
       发送body给downsstream时用到 */
    sr->subrequest_in_memory = (flags & NGX_HTTP_SUBREQUEST_IN_MEMORY) != 0;
    sr->waited = (flags & NGX_HTTP_SUBREQUEST_WAITED) != 0;

    sr->unparsed_uri = r->unparsed_uri;
    sr->method_name = ngx_http_core_get_method;
    sr->http_protocol = r->http_protocol;

    ngx_http_set_exten(sr);
    /* 主请求保存在main字段中 */
    sr->main = r->main;
    /* 父请求为当前请求 */
    sr->parent = r;
    /* 保存回调handler及数据，在子请求执行完，将会调用 */
    sr->post_subrequest = ps;
    /* 读事件handler赋值为不做任何事的函数，因为子请求不用再读数据或者检查连接状态；
       写事件handler为ngx_http_handler，它会重走phase */
    sr->read_event_handler = ngx_http_request_empty_handler;
    sr->write_event_handler = ngx_http_handler;

    /* ngx_connection_s的data字段比较关键，它保存了当前可以向out chain输出数据的请求，
       具体意义后面会做详细介绍 */
    if (c->data == r && r->postponed == NULL) {
        c->data = sr;
    }
    /* 默认共享父请求的变量，当然你也可以根据需求在创建完子请求后，再创建子请求独立的变量集 */
    sr->variables = r->variables;

    sr->log_handler = r->log_handler;

    pr = ngx_palloc(r->pool, sizeof(ngx_http_postponed_request_t));
    if (pr == NULL) {
        return NGX_ERROR;
    }

    pr->request = sr;
    pr->out = NULL;
    pr->next = NULL;
    /* 把该子请求挂载在其父请求的postponed链表的队尾 */
    if (r->postponed) {
        for (p = r->postponed; p->next; p = p->next) { /* void */ }
        p->next = pr;

    } else {
        r->postponed = pr;
    }
    /* 子请求为内部请求，它可以访问internal类型的location */
    sr->internal = 1;
    /* 继承父请求的一些状态 */
    sr->discard_body = r->discard_body;
    sr->expect_tested = 1;
    sr->main_filter_need_in_memory = r->main_filter_need_in_memory;

    sr->uri_changes = NGX_HTTP_MAX_URI_CHANGES + 1;

    tp = ngx_timeofday();
    r->start_sec = tp->sec;
    r->start_msec = tp->msec;

    r->main->subrequests++;
    /* 增加主请求的引用数，这个字段主要是在ngx_http_finalize_request调用的一些结束请求和
       连接的函数中使用 */
    r->main->count++;

    *psr = sr;
    /* 将该子请求挂载在主请求的posted_requests链表队尾 */
    return ngx_http_post_request(sr, NULL);
}
```

到这时，子请求创建完毕，一般来说子请求的创建都发生在某个请求的content handler或者某个filter内，从上面的函数可以看到子请求并没有马上被执行，`只是被挂载在了主请求的posted_requests链表中`，那它什么时候可以执行呢？之前说到posted_requests链表是在ngx_http_run_posted_requests函数中遍历，那么ngx_http_run_posted_requests函数又是在什么时候调用？它实际上是`在某个请求的读（写）事件的handler中`，执行完该请求相关的处理后被调用，比如主请求在走完一遍PHASE的时候会调用ngx_http_run_posted_requests，这时子请求得以运行。

这时实际还有一个问题需要解决，由于nginx是多进程，是不能够随意阻塞的（如果一个请求阻塞了当前进程，就相当于阻塞了这个进程accept到的所有其他请求，同时该进程也不能accept新请求），一个请求可能由于某些原因需要阻塞（比如访问io），nginx的做法是设置该请求的一些状态并在epoll中添加相应的事件，然后转去处理其他请求，等到该事件到来时再继续处理该请求，这样的行为就意味着一个请求可能需要多次执行机会才能完成，对于一个请求的多个子请求来说，意味着它们完成的先后顺序可能和它们创建的顺序是不一样的，所以`必须有一种机制让提前完成的子请求保存它产生的数据，而不是直接输出到out chain，同时也能够让当前能够往out chain输出数据的请求及时的输出产生的数据`。作者Igor采用`ngx_connection_t中的data字段`，以及一个body filter，即`ngx_http_postpone_filter`，还有`ngx_http_finalize_request函数中的一些逻辑`来解决这个问题。

下面用一个图来做说明，下图是某时刻某个主请求和它的所有子孙请求的树结构：

![子请求](/images/post/subrequest.png)

图中的root节点即为主请求，它的postponed链表从左至右挂载了3个节点，SUB1是它的第一个子请求，DATA1是它产生的一段数据，SUB2是它的第2个子请求，而且这2个子请求分别有它们自己的子请求及数据。ngx_connection_t中的data字段保存的是当前可以往out chain发送数据的请求，文章开头说到发到客户端的数据必须按照子请求创建的顺序发送，这里即是按后续遍历的方法（SUB11->DATA11->SUB12->DATA12->(SUB1)->DATA1->SUB21->SUB22->(SUB2)->(ROOT)），上图中当前能够往客户端（out chain）发送数据的请求显然就是SUB11，如果SUB12提前执行完成，并产生数据DATA121，只要前面它还有节点未发送完毕，DATA121只能先挂载在SUB12的postponed链表下。这里还要注意一下的是c->data的设置，当SUB11执行完并且发送完数据之后，下一个将要发送的节点应该是DATA11，但是该节点实际上保存的是数据，而不是子请求，所以c->data这时应该指向的是拥有改数据节点的SUB1请求。

下面看下源码具体是怎样实现的，首先是`ngx_http_postpone_filter函数`：

```c
static ngx_int_t
ngx_http_postpone_filter(ngx_http_request_t *r, ngx_chain_t *in)
{
    ...
    /* 当前请求不能往out chain发送数据，如果产生了数据，新建一个节点，
       将它保存在当前请求的postponed队尾。这样就保证了数据按序发到客户端 */
    if (r != c->data) {

        if (in) {
            ngx_http_postpone_filter_add(r, in);
            return NGX_OK;
        }
        ...
        return NGX_OK;
    }
    /* 到这里，表示当前请求可以往out chain发送数据，如果它的postponed链表中没有子请求，也没有数据，
       则直接发送当前产生的数据in或者继续发送out chain中之前没有发送完成的数据 */
    if (r->postponed == NULL) {

        if (in || c->buffered) {
            return ngx_http_next_filter(r->main, in);
        }
        /* 当前请求没有需要发送的数据 */
        return NGX_OK;
    }
    /* 当前请求的postponed链表中之前就存在需要处理的节点，则新建一个节点，保存当前产生的数据in，
       并将它插入到postponed队尾 */
    if (in) {
        ngx_http_postpone_filter_add(r, in);
    }
    /* 处理postponed链表中的节点 */
    do {
        pr = r->postponed;
        /* 如果该节点保存的是一个子请求，则将它加到主请求的posted_requests链表中，
           以便下次调用ngx_http_run_posted_requests函数，处理该子节点 */
        if (pr->request) {

            ngx_log_debug2(NGX_LOG_DEBUG_HTTP, c->log, 0,
                           "http postpone filter wake \"%V?%V\"",
                           &pr->request->uri, &pr->request->args);

            r->postponed = pr->next;

            /* 按照后续遍历产生的序列，因为当前请求（节点）有未处理的子请求(节点)，
               必须先处理完改子请求，才能继续处理后面的子节点。
               这里将该子请求设置为可以往out chain发送数据的请求。  */
            c->data = pr->request;
            /* 将该子请求加入主请求的posted_requests链表 */
            return ngx_http_post_request(pr->request, NULL);
        }
        /* 如果该节点保存的是数据，可以直接处理该节点，将它发送到out chain */
        if (pr->out == NULL) {
            ngx_log_error(NGX_LOG_ALERT, c->log, 0,
                          "http postpone filter NULL output",
                          &r->uri, &r->args);

        } else {
            ngx_log_debug2(NGX_LOG_DEBUG_HTTP, c->log, 0,
                           "http postpone filter output \"%V?%V\"",
                           &r->uri, &r->args);

            if (ngx_http_next_filter(r->main, pr->out) == NGX_ERROR) {
                return NGX_ERROR;
            }
        }

        r->postponed = pr->next;

    } while (r->postponed);

    return NGX_OK;
}
```

再来看`ngx_http_finalzie_request函数`：

```c
void
ngx_http_finalize_request(ngx_http_request_t *r, ngx_int_t rc)
{
  ...
    /* 如果当前请求是一个子请求，检查它是否有回调handler，有的话执行之 */
    if (r != r->main && r->post_subrequest) {
        rc = r->post_subrequest->handler(r, r->post_subrequest->data, rc);
    }

  ...

    /* 子请求 */
    if (r != r->main) {
        /* 该子请求还有未处理完的数据或者子请求 */
        if (r->buffered || r->postponed) {
            /* 添加一个该子请求的写事件，并设置合适的write event hander，
               以便下次写事件来的时候继续处理，这里实际上下次执行时会调用ngx_http_output_filter函数，
               最终还是会进入ngx_http_postpone_filter进行处理 */
            if (ngx_http_set_write_handler(r) != NGX_OK) {
                ngx_http_terminate_request(r, 0);
            }

            return;
        }
        ...

        pr = r->parent;


        /* 该子请求已经处理完毕，如果它拥有发送数据的权利，则将权利移交给父请求， */
        if (r == c->data) {

            r->main->count--;

            if (!r->logged) {

                clcf = ngx_http_get_module_loc_conf(r, ngx_http_core_module);

                if (clcf->log_subrequest) {
                    ngx_http_log_request(r);
                }

                r->logged = 1;

            } else {
                ngx_log_error(NGX_LOG_ALERT, c->log, 0,
                              "subrequest: \"%V?%V\" logged again",
                              &r->uri, &r->args);
            }

            r->done = 1;
            /* 如果该子请求不是提前完成，则从父请求的postponed链表中删除 */
            if (pr->postponed && pr->postponed->request == r) {
                pr->postponed = pr->postponed->next;
            }
            /* 将发送权利移交给父请求，父请求下次执行的时候会发送它的postponed链表中可以
               发送的数据节点，或者将发送权利移交给它的下一个子请求 */
            c->data = pr;

        } else {
            /* 到这里其实表明该子请求提前执行完成，而且它没有产生任何数据，则它下次再次获得
               执行机会时，将会执行ngx_http_request_finalzier函数，它实际上是执行
               ngx_http_finalzie_request（r,0），也就是什么都不干，直到轮到它发送数据时，
               ngx_http_finalzie_request函数会将它从父请求的postponed链表中删除 */
            r->write_event_handler = ngx_http_request_finalizer;

            if (r->waited) {
                r->done = 1;
            }
        }
        /* 将父请求加入posted_request队尾，获得一次运行机会 */
        if (ngx_http_post_request(pr, NULL) != NGX_OK) {
            r->main->count++;
            ngx_http_terminate_request(r, 0);
            return;
        }

        return;
    }
    /* 这里是处理主请求结束的逻辑，如果主请求有未发送的数据或者未处理的子请求，
       则给主请求添加写事件，并设置合适的write event hander，
       以便下次写事件来的时候继续处理 */
    if (r->buffered || c->buffered || r->postponed || r->blocked) {

        if (ngx_http_set_write_handler(r) != NGX_OK) {
            ngx_http_terminate_request(r, 0);
        }

        return;
    }

 ...
}
```

---
*转自[这里](http://tengine.taobao.org/book/chapter_12.html#subrequest-99)*
