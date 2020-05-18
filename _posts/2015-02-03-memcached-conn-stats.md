---
title: "Memcached之conn_stats结构"
description: ""
category: knowledge
tags: [memcached, src]
---

## memcached连接状态
```c
enum conn_states
{
   0 conn_listening,  /**< the socket which listens for connections */
   1 conn_new_cmd,    /**< Prepare connection for next command */
   2 conn_waiting,    /**< waiting for a readable socket */
   3 conn_read,       /**< reading in a command line */
   4 conn_parse_cmd,  /**< try to parse a command from the input buffer */
   5 conn_write,      /**< writing out a simple response */
   6 conn_nread,      /**< reading in a fixed number of bytes */
   7 conn_swallow,    /**< swallowing unnecessary bytes w/o storing */
   8 conn_closing,    /**< closing this connection */
   9 conn_mwrite,     /**< writing out many items sequentially */
   10 conn_max_state   /**< Max state value (used for assertion) */
};
```
