---
layout: default
title: 使用Curl测试https资源
category: tools
tags: [curl, https]
---

* 目录
{:toc #markdown-toc}

平时开发时，我们经常使用curl做请求测试。
由于Nginx不支持CONNECT方法，使用curl代理访问https必须绕过CONNECT方法。

## 指定Host头[非代理]
不使用代理访问https资源， 请求示例：

    curl -kvo /dev/null 'https://123.123.123.123:443/md5js/1.0/md5.min.js' -H 'Host: www.example.com'
    GET /md5js/1.0/md5.min.js HTTP/1.1

*-k*，放弃校验连接安全性，即不验证证书中的域名。

## 设定解析到固定ip[非代理]
不使用代理访问https资源， 请求示例：

    curl -vo /dev/null 'https://www.example.com/md5js/1.0/md5.min.js' --resolve www.example.com:443:123.123.123.123
    GET /md5js/1.0/md5.min.js HTTP/2

*--resolve*，类似于/etc/hosts，防止dns域名解析带来的影响，需要 *curl-7.21.3以上* 版本支持

注意，默认发送了HTTP2请求

## 使用https代理访问http资源
请求示例：

    curl -vo /dev/null 'http://www.example.com/md5js/1.0/md5.min.js' -x https://123.123.123.123:443 --proxy-insecure
    GET http://www.example.com/md5js/1.0/md5.min.js HTTP/1.1

*--proxy-insecure*，含义同-k，但用于https代理上下文，需要curl-7.52.0以上版本支持

## 以下方法不可行
默认使用CONNECT方法，Nginx响应400， 请求示例：

    curl -kvo /dev/null 'https://www.example.com/md5js/1.0/md5.min.js' -x 123.123.123.123:443
    CONNECT www.example.com:443 HTTP/1.1

## 结论
由于curl使用代理访问https这样那样的问题，推荐不通过代理直接使用curl访问https资源。
推荐使用方法1，方法2。

