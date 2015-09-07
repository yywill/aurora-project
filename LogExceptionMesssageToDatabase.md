## 摘要 ##

> 以前Aurora的日志信息主要记录在文本文件中，管理员需要查看系统运行状态时，首先要登录服务器本地，并需要经常性的打开日志文件查看运行状况。但日志文件很多，文件内容很大时，迅速的找到异常信息变得困难。

> 现在Aurora支持把系统配置、运行等出现的错误信息记录到数据库中，方便系统管理员更加有效的监控系统，并在日志中记录较为详尽的上下文信息，以便为排除故障提供有效帮助。


## 功能部署 ##

  * 从[aurora-framework](http://www.aurora-framework.org/release/)上下载2011.07.12后的aurora.jar版本
  * 打开位于[[WEB\_HOME](WEB_HOME.md)]/web-inf/aurora.config文件，在文件末尾添加如下配置信息：
```
<?xml version="1.0" encoding="UTF-8"?>
<aurora-config>
        <!--其他配置....-->
	<exception-database-log xmlns="aurora.service.exception">
	   <!-- 定义创建异常记录的SQL语句 -->
           <insert-sql>
	     begin
	       insert into fnd_exception_logs ( id,exception_type, 
               exception_message,source ,context ,root_stack_trace,full_stack_trace,role_id)
 	        values (fnd_exception_logs_s.nextval, ?, ?, ?, ?,?,?,'${/session/@role_id}' );
	     end;
	   </insert-sql>
	</exception-database-log>
</aurora-config>
```
  * 在数据库中添加表fnd\_exception\_logs和序列号fnd\_exception\_logs\_s,表结构如下
```
-- Create table
create table FND_EXCEPTION_LOGS
(
  ID                NUMBER not null,
  EXCEPTION_TYPE    VARCHAR2(200),
  EXCEPTION_MESSAGE VARCHAR2(2000),
  SOURCE            VARCHAR2(200),
  CONTEXT           CLOB,
  ROOT_STACK_TRACE  CLOB,
  FULL_STACK_TRACE  CLOB,
  ROLE_ID           NUMBER,
  CREATION_DATE     DATE default sysdate not null,
  CREATED_BY        NUMBER default 0 not null,
  LAST_UPDATE_DATE  DATE default sysdate not null,
  LAST_UPDATED_BY   NUMBER default 0 not null
);
alter table FND_EXCEPTION_LOGS
  add constraint FND_EXCEPTION_LOGS_PK primary key (ID);
create sequence fnd_exception_logs_s;


```
> 根据需要可以客户化这个表结构，譬如任意添加或减少字段。但注意一点，额外的字段默认处理成 **字符串** 类型，如同上文中的role\_id对应的内容${/session/@role\_id}需要两个单引号括起来才可以。
  * 配置完毕，重新启动web服务器即可。