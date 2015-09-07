## 使用C3P0连接池的连接泄露诊断方法 ##

### 启用C3P0的连接归还超时设置 ###

在C3P0的属性配置文件（0.datasource.config）中，设置以下属性：
```
				debugUnreturnedConnectionStackTraces=true
				unreturnedConnectionTimeout=1200
```

其中：
debugUnreturnedConnectionStackTraces是一个开关，启用之后，对于每个从连接池拿出去的数据库连接，如果一段时间内没有归还，C3P0就会强制关闭这个连接，并将获取连接时的stack trace，以抛出异常的方式显示出来。
unreturnedConnectionTimeout设置多长时间会超时，以秒为单位。

假设系统中怀疑有连接泄露，那么，就可以启用这个功能，评估所有页面执行完成需要的最长时间，例如20分钟，然后将unreturnedConnectionTimeout设置为略大于这个时间。

### 设置C3P0的log输出 ###

为了能看到C3P0抛出的异常信息，还需要设置C3P0的log属性。最简单的方式就是让C3P0使用JDK标准的log API，这样不需要加载额外的jar。在启动JVM时，设置启动参数：
-Dcom.mchange.v2.log.MLog=com.mchange.v2.log.jdk14logging.Jdk14MLog

在Tomcat中，可修改catalina.sh，设置JAVA\_OPTS变量包含上述内容。

可以做一个测试：设置C3P0属性debugUnreturnedConnectionStackTraces=true，unreturnedConnectionTimeout=1，然后访问一个运行时间超过1秒的页面。这样，就会在tomcat的输出窗口看到这样一段信息：

```
信息: Logging the stack trace by which the overdue resource was checked-out.
java.lang.Exception: DEBUG ONLY: Overdue resource check-out stack trace.
	at com.mchange.v2.resourcepool.BasicResourcePool.checkoutResource(BasicResourcePool.java:506)
	at com.mchange.v2.c3p0.impl.C3P0PooledConnectionPool.checkoutPooledConnection(C3P0PooledConnectionPool.java:525)
	at com.mchange.v2.c3p0.impl.AbstractPoolBackedDataSource.getConnection(AbstractPoolBackedDataSource.java:128)
	at aurora.database.service.SqlServiceContext.initConnection(SqlServiceContext.java:168)
	at aurora.database.service.BusinessModelService.prepareForRun(BusinessModelService.java:112)
	at aurora.database.service.BusinessModelService.query(BusinessModelService.java:188)
	at aurora.database.actions.ModelQuery.doQuery(ModelQuery.java:53)
	at aurora.database.actions.AbstractQueryAction.query(AbstractQueryAction.java:104)
	at aurora.database.actions.AbstractQueryAction.run(AbstractQueryAction.java:115)
	at uncertain.proc.ProcedureRunner.run(ProcedureRunner.java:253)
	at uncertain.proc.ProcedureRunner.run(ProcedureRunner.java:290)
	at uncertain.proc.Procedure.run(Procedure.java:94)
	at uncertain.proc.ProcedureRunner.run(ProcedureRunner.java:247)
	at aurora.application.features.AbstractProcedureInvoker.runProcedure(AbstractProcedureInvoker.java:40)
	at aurora.application.features.InitProcedureInvoker.doInvoke(InitProcedureInvoker.java:33)
	at aurora.application.features.InitProcedureInvoker.onCreateModel(InitProcedureInvoker.java:37)
	at sun.reflect.NativeMethodAccessorImpl.invoke0(Native Method)
	at sun.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:39)
	at sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:25)
	at java.lang.reflect.Method.invoke(Method.java:597)
	at uncertain.proc.ReflectionMethodHandle.handleEvent(ReflectionMethodHandle.java:93)
	at uncertain.proc.ReflectionMethodHandle.handleEvent(ReflectionMethodHandle.java:50)
	at uncertain.event.Configuration.fireEventInternal(Configuration.java:403)
	at uncertain.event.Configuration.fireEvent(Configuration.java:341)
	at uncertain.proc.ProcedureRunner.fireEvent(ProcedureRunner.java:312)
	at uncertain.proc.Action.run(Action.java:171)
	at uncertain.proc.ProcedureRunner.run(ProcedureRunner.java:253)
	at uncertain.proc.ProcedureRunner.run(ProcedureRunner.java:290)
	at uncertain.proc.Procedure.run(Procedure.java:94)
	at uncertain.proc.Switch.run(Switch.java:87)
	at uncertain.proc.ProcedureRunner.run(ProcedureRunner.java:253)
	at uncertain.proc.ProcedureRunner.run(ProcedureRunner.java:290)
	at uncertain.proc.Procedure.run(Procedure.java:94)
	at uncertain.proc.ProcedureRunner.run(ProcedureRunner.java:247)
	at aurora.service.ServiceInstance.invoke(ServiceInstance.java:124)
	at aurora.service.http.AbstractFacadeServlet.service(AbstractFacadeServlet.java:116)
	at javax.servlet.http.HttpServlet.service(HttpServlet.java:722)
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:306)
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:210)
	at org.apache.catalina.core.StandardWrapperValve.invoke(StandardWrapperValve.java:240)
	at org.apache.catalina.core.StandardContextValve.invoke(StandardContextValve.java:161)
	at org.apache.catalina.core.StandardHostValve.invoke(StandardHostValve.java:164)
	at org.apache.catalina.valves.ErrorReportValve.invoke(ErrorReportValve.java:100)
	at org.apache.catalina.valves.AccessLogValve.invoke(AccessLogValve.java:541)
	at org.apache.catalina.core.StandardEngineValve.invoke(StandardEngineValve.java:118)
	at org.apache.catalina.connector.CoyoteAdapter.service(CoyoteAdapter.java:383)
	at org.apache.coyote.http11.Http11Processor.process(Http11Processor.java:243)
	at org.apache.coyote.http11.Http11Protocol$Http11ConnectionHandler.process(Http11Protocol.java:188)
	at org.apache.coyote.http11.Http11Protocol$Http11ConnectionHandler.process(Http11Protocol.java:166)
	at org.apache.tomcat.util.net.JIoEndpoint$SocketProcessor.run(JIoEndpoint.java:288)
	at java.util.concurrent.ThreadPoolExecutor$Worker.runTask(ThreadPoolExecutor.java:886)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:908)
	at java.lang.Thread.run(Thread.java:680)
```
这就是C3P0发现连接1秒钟后没有归还，强制关闭连接后抛出的信息，从stack trace中可以看出，获取连接是发生在aurora.database.service.BusinessModelService.query，也就是调用BM的query。


由于页面确实是需要使用连接超过1秒，正在使用的连接被强制关闭以后，还会看到这样的信息：

```
011-6-22 13:24:15 com.mchange.v2.c3p0.impl.NewPooledConnection handleThrowable
警告: [c3p0] A PooledConnection that has already signalled a Connection error is still in use!
```

后续SQL操作再使用这个连接时，会发现连接已经关闭，于是就会抛出类似这样的异常：

```
2011-6-22 13:24:15 com.mchange.v2.c3p0.impl.NewPooledConnection handleThrowable
警告: [c3p0] Another error has occurred [ java.sql.SQLException: 关闭的连接 ] which will not be reported to listeners!
java.sql.SQLException: 关闭的连接
	at oracle.jdbc.dbaccess.DBError.throwSqlException(DBError.java:134)
	at oracle.jdbc.dbaccess.DBError.throwSqlException(DBError.java:179)
	at oracle.jdbc.dbaccess.DBError.throwSqlException(DBError.java:269)
	at oracle.jdbc.driver.OracleConnection.rollback(OracleConnection.java:1439)
	at com.mchange.v2.c3p0.impl.NewProxyConnection.rollback(NewProxyConnection.java:855)
	at aurora.transaction.UserTransactionImpl.rollback(UserTransactionImpl.java:58)
	at aurora.service.http.AbstractFacadeServlet.service(AbstractFacadeServlet.java:141)
	at javax.servlet.http.HttpServlet.service(HttpServlet.java:722)
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:306)
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:210)
	at org.apache.catalina.core.StandardWrapperValve.invoke(StandardWrapperValve.java:240)
	at org.apache.catalina.core.StandardContextValve.invoke(StandardContextValve.java:161)
	at org.apache.catalina.core.StandardHostValve.invoke(StandardHostValve.java:164)
	at org.apache.catalina.valves.ErrorReportValve.invoke(ErrorReportValve.java:100)
	at org.apache.catalina.valves.AccessLogValve.invoke(AccessLogValve.java:541)
	at org.apache.catalina.core.StandardEngineValve.invoke(StandardEngineValve.java:118)
	at org.apache.catalina.connector.CoyoteAdapter.service(CoyoteAdapter.java:383)
	at org.apache.coyote.http11.Http11Processor.process(Http11Processor.java:243)
	at org.apache.coyote.http11.Http11Protocol$Http11ConnectionHandler.process(Http11Protocol.java:188)
	at org.apache.coyote.http11.Http11Protocol$Http11ConnectionHandler.process(Http11Protocol.java:166)
	at org.apache.tomcat.util.net.JIoEndpoint$SocketProcessor.run(JIoEndpoint.java:288)
	at java.util.concurrent.ThreadPoolExecutor$Worker.runTask(ThreadPoolExecutor.java:886)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:908)
	at java.lang.Thread.run(Thread.java:680)
```