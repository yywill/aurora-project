## 概述 ##

通过该特性，可以记录客户端的访问信息，以及每次响应处理内部步骤所花费的时间

## 数据库对象 ##

需要在数据库中创建以下表：

```
-- 请求记录表
create table SYS_RUNTIME_REQUEST_RECORD
(
  REQUEST_ID                  VARCHAR2(100) not null,
  ENTER_TIME                  DATE,
  EXIT_TIME                   DATE,
  DURATION                    NUMBER,
  IS_SUCCESS                  VARCHAR2(5),
  CLIENT_ADDRESS              VARCHAR2(100),
  USER_AGENT                  VARCHAR2(200),
  CLIENT_OS_FAMILY            VARCHAR2(50),
  CLIENT_OS                   VARCHAR2(50),
  CLIENT_OS_VERSION           VARCHAR2(50),
  CLIENT_BROWSER_FAMILY       VARCHAR2(50),
  CLIENT_BROWSER              VARCHAR2(50),
  CLIENT_BROWSER_VERSION      VARCHAR2(50),
  CLIENT_RENDERER_KIT         VARCHAR2(50),
  CLIENT_RENDERER_KIT_VERSION VARCHAR2(50),
  CLIENT_PLATFORM             VARCHAR2(50),
  ACCEPT_LANGUAGE             VARCHAR2(300),
  SERVER_NAME                 VARCHAR2(50),
  SERVER_PORT                 NUMBER,
  CONTEXT_PATH                VARCHAR2(100),
  URL                         VARCHAR2(300),
  QUERY_STRING                VARCHAR2(1000),
  REFERER                     VARCHAR2(300),
  SESSION_ID                  NUMBER,
  USER_ID                     NUMBER
)
;
alter table SYS_RUNTIME_REQUEST_RECORD
  add primary key (REQUEST_ID);

-- 请求处理时间记录表
create table SYS_RUNTIME_REQUEST_DETAIL
(
  REQUEST_ID   VARCHAR2(100) not null,
  SEQUENCE_NUM NUMBER not null,
  NAME         VARCHAR2(200),
  ENTER_TIME   DATE,
  EXIT_TIME    DATE,
  DURATION     NUMBER
)
;
alter table SYS_RUNTIME_REQUEST_DETAIL
  add primary key (REQUEST_ID, SEQUENCE_NUM);

-- 异常信息记录表

create table SYS_RUNTIME_EXCEPTION_LOG
(
  EXCEPTION_ID      NUMBER not null,
  EXCEPTION_TYPE    VARCHAR2(200),
  EXCEPTION_MESSAGE VARCHAR2(2000),
  REQUEST_ID        VARCHAR2(100),
  CONTEXT_DUMP      CLOB,
  ROOT_STACK_TRACE  CLOB,
  FULL_STACK_TRACE  CLOB,
  SESSION_ID        NUMBER,
  CREATION_TIME     DATE default sysdate
)
;
alter table SYS_RUNTIME_EXCEPTION_LOG
  add primary key (EXCEPTION_ID);
create index SYS_RUNTIME_EXCEPTION_LOG_IDX1 on SYS_RUNTIME_EXCEPTION_LOG (REQUEST_ID);
create index SYS_RUNTIME_EXCEPTION_LOG_IDX2 on SYS_RUNTIME_EXCEPTION_LOG (EXCEPTION_TYPE);

create sequence SYS_RUNTIME_EXCEPTION_LOG_S;
```

其中，SYS\_RUNTIME\_REQUEST\_RECORD记录每次客户端请求的信息，如开始时间，结束时间，耗时（毫秒），客户端浏览器、操作系统、IP地址等，例如：

```
   	REQUEST_ID	ENTER_TIME	EXIT_TIME	DURATION	IS_SUCCESS	CLIENT_ADDRESS	USER_AGENT	CLIENT_OS_FAMILY	CLIENT_OS	CLIENT_OS_VERSION	CLIENT_BROWSER_FAMILY	CLIENT_BROWSER	CLIENT_BROWSER_VERSION	CLIENT_RENDERER_KIT	CLIENT_RENDERER_KIT_VERSION	CLIENT_PLATFORM	ACCEPT_LANGUAGE	SERVER_NAME	SERVER_PORT	CONTEXT_PATH	URL	QUERY_STRING	REFERER	SESSION_ID	USER_ID
1	59fa7bfd-aea6-4480-9b5c-b75f80995236	2011/9/26 15:04:20	2011/9/26 15:04:21	544	1	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/535.1 (KHTML, like Gecko) Chrome/14.0.835.186 Safari/535.1	Mac	MacOSX	MacOS 10_6_8	KHTML	KHTML(Chrome)	KHTML(Chrome14.0.835.186)			Macintosh; Intel Mac OS X 10_6_8	zh-CN,zh;q=0.8	localhost	8080	/hec	/hec/modules/sys/sys_user.screen		http://localhost:8080/hec/main.screen	1	101
2	585d8d92-6f27-4d7d-a12b-90bc3fa0b048	2011/9/26 15:04:21	2011/9/26 15:04:21	118	0	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/535.1 (KHTML, like Gecko) Chrome/14.0.835.186 Safari/535.1	Mac	MacOSX	MacOS 10_6_8	KHTML	KHTML(Chrome)	KHTML(Chrome14.0.835.186)			Macintosh; Intel Mac OS X 10_6_8	zh-CN,zh;q=0.8	localhost	8080	/hec	/hec/autocrud/sys.login_account_query/query	pagesize=10&pagenum=1&_fetchall=false&_autocount=true	http://localhost:8080/hec/modules/sys/sys_user.screen	1	101
3	d9273457-3bc8-4a2e-a58c-ff9192a7bce8	2011/9/26 15:06:37	2011/9/26 15:06:37	114	0	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/535.1 (KHTML, like Gecko) Chrome/14.0.835.186 Safari/535.1	Mac	MacOSX	MacOS 10_6_8	KHTML	KHTML(Chrome)	KHTML(Chrome14.0.835.186)			Macintosh; Intel Mac OS X 10_6_8	zh-CN,zh;q=0.8	localhost	8080	/hec	/hec/autocrud/sys.login_account_query/query	pagesize=10&pagenum=1&_fetchall=false&_autocount=true	http://localhost:8080/hec/modules/sys/sys_user.screen	1	101
4	027b18d3-6076-46f3-aae7-84ee50a9a4f4	2011/9/26 15:08:01	2011/9/26 15:08:01	192	0	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/535.1 (KHTML, like Gecko) Chrome/14.0.835.186 Safari/535.1	Mac	MacOSX	MacOS 10_6_8	KHTML	KHTML(Chrome)	KHTML(Chrome14.0.835.186)			Macintosh; Intel Mac OS X 10_6_8	zh-CN,zh;q=0.8	localhost	8080	/hec	/hec/autocrud/sys.login_account_query/query	pagesize=10&pagenum=1&_fetchall=false&_autocount=true	http://localhost:8080/hec/modules/sys/sys_user.screen	1	101
```

SYS\_RUNTIME\_REQUEST\_DETAIL进一步记录在每次请求内部，各个节点的处理时间，如：
```
REQUEST_ID	SEQUENCE_NUM	NAME	ENTER_TIME	EXIT_TIME	DURATION
59fa7bfd-aea6-4480-9b5c-b75f80995236	1	set	2011/9/26 15:04:20	2011/9/26 15:04:20	1
59fa7bfd-aea6-4480-9b5c-b75f80995236	2	model-query[sys.sys_user]	2011/9/26 15:04:20	2011/9/26 15:04:21	173
59fa7bfd-aea6-4480-9b5c-b75f80995236	3	BuildOutputContent	2011/9/26 15:04:21	2011/9/26 15:04:21	292
```

从这个表的记录可以看出一次响应大多数的时间花费在哪里，有利于定位性能短板。

SYS\_RUNTIME\_EXCEPTION\_LOG记录请求处理过程中发生的错误，其中REQUEST\_ID对应发生该错误的请求记录，CONTEXT\_DUMP记录当时的context内容，FULL\_STACK\_TRACE记录当时的java堆栈。

## 配置 ##

首先，在WEB-INF下创建配置文件
```
<f:request-recorder xmlns:f="aurora.application.features" /> 
```
该类监听每一次请求，将请求信息放进一个内部队列，再启动一个线程将队列中的信息写入数据库。
大多数属性都可以取缺省值，可配置的属性说明如下：
（所有时间单位都是毫秒）
| 属性 | 含义 | 缺省值 |
|:---|:---|:----|
| checkInterval | 多长时间检查一次队列 | 1000 |
| connectionIdleTime | 数据库连接多长时间自动关闭 | 20 **60** 1000，即20分钟 |
| requestSaveBm | 保存请求信息的BM的名字 | sys.monitor.sys\_runtime\_request\_record |
| saveDetail | 是否保存每次请求内部各步骤的处理时间 | true |
| batchSize | 一次处理队列中的记录数 | 100 |

然后，在service-listener.config文件中增加一行：
```
		<participant class="aurora.application.features.RequestRecorder"/>
```

这样，就可以在数据库中看到每次请求的记录了。

## JMX监控 ##
此特性提供MBean用于监控当前状态，MBean路径为
```
<应用名>/Application/RequestRecorder
```
提供的属性：
| 属性 | 含义 |
|:---|:---|
| CurrentQueueSize | 当前待处理队列大小 |
| MaxQueueSize | 待处理队列曾经达到过的最大size |
| MaxQueueSizeTime | 待处理队列达到最大size的时间 |
| RequestCount | 请求总次数 |
| TotalProcessTime | 花费在处理请求上面的总时间 |
| AverageProcessTime | 平均每个请求的保存时间 |
| ProcessedCount | 已处理的请求数 |

## 数据统计与分析 ##

如果系统每日请求数很多，那么SYS\_RUNTIME\_REQUEST\_DETAIL表将会积累很多的记录。由于对这个表的使用主要是进行统计分析，为提高性能，可定期将该表中的数据按天汇总，转存到另一个统计表中，再清理这部分数据。例如：
```
create table SYS_RUNTIME_REQUEST_STAT_DAY
(
  STAT_DATE   DATE not null,
  URL         VARCHAR2(300) not null,
  ACTION_NAME VARCHAR2(200) not null,
  TOTAL_COUNT NUMBER,
  AVG_TIME    NUMBER,
  MAX_TIME    NUMBER,
  MIN_TIME    NUMBER,
  MEDIAN_TIME NUMBER
)
```
再定期运行下面的SQL来进行统计汇总：
```
insert into sys_runtime_request_stat_day
select trunc(r.enter_time), r.url, d.name, count(*), avg(d.duration), max(d.duration), min(d.duration), median(d.duration)
from sys_runtime_request_detail d, sys_runtime_request_record r
where d.request_id = r.request_id
group by  trunc(r.enter_time), r.url, d.name
```

基于请求记录表，可以做各类分析，包括：
  * 系统各时段的负载状况
  * 请求平均响应时间，按时段，模块等维度分类；
  * 用户地理位置，浏览器，操作系统分析等；
  * 用户使用习惯分析，例如最经常使用的功能，用户点击路径分析，等等；
  * 性能短板分析，最耗时的请求，其中最耗时的步骤

基于异常记录表，可以还原大部分现场数据，排查错误。也可以对一段时间内的异常情况进行统计分析，及早发现问题。