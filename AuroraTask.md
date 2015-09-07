# 简介 #

Aurora后台任务是指任务在后台依次运行。用户在前台提交一个任务后，无需一直等待任务执行完成，可以马上转而处理其他事项，稍等片刻后，通过系统的任务管理器查看刚才提交任务的执行情况。它适用于长时间运行或者对响应时间要求不高的任务请求。


# 详细设计 #

  * Aurora后台任务按照优先级顺序依次执行。支持调用Java任务和数据库存储过程任务。每个任务表现为一条数据库表里的记录，记录中存储了任务类型，任务上下文（比如用户和参数），并在处理异常时更新异常信息和状态。表结构如下：

> 表名：**SYS\_TASKS**
|字段名|数据类型|可否为空|描述|
|:--|:---|:---|:-|
|TASK\_ID|NUMBER|否   |主键|
|TASK\_NAME|VARCHAR2(30)|是   |任务名称|
|TASK\_DESCRIPTION|VARCHAR2(200)|是   |任务描述|
|EXECUTOR\_INSTANCE|VARCHAR2(100)|是   |指定服务器执行，默认为空即不限服务器|
|PRIORITY|NUMBER|是   |优先级，越小优先级越高|
|TASK\_TYPE|VARCHAR2(30)|是   |SQL或JAVA任务|
|SQL|VARCHAR2(2000)|是   |执行的SQL语句|
|PROC\_FILE\_PATH|VARCHAR2(200)|是   |PROC文件路径，和PROC\_CONTENT二选一，PROC是aurora系统自定义的java任务|
|PROC\_CONTENT|CLOB|是   |PROC内容，和PROC文件路径二选一|
|CONTEXT|CLOB|是   |上下文内容|
|START\_TIME|DATE|是   |任务开始时间|
|EXCEPTION|CLOB|是   |运行时异常|
|STATUS|VARCHAR2(30)|是   |任务状态|
|LAST\_UPDATE\_DATE|DATE|否   |最后更新日期|
|LAST\_UPDATED\_BY|NUMBER|否   |最后更新用户ID|
|CREATION\_DATE|DATE|否   |创建日期|
|CREATED\_BY|NUMBER|否   |创建用户ID|


  * 数据库中创建了一个存储过程来处理分发新任务和更新任务状态。这个存储过程叫sys\_tasks\_pkg，用存储过程来实现任务分发算法是因为它可以根据各个项目的需要，方便的实现自定义算法。

  * aurora系统中启用任务处理器后，它会通过sys\_tasks\_pkg.gettask 获得一个尚未处理的任务，执行任务后，根据任务的执行情况更新任务的状态，如果中途发生异常，那么捕获此异常，并更新记录的异常信息，并标识此记录的状态为“处理异常”。如果未发生异常，即正常执行完，那么更新任务状态为“完成”。

  * 用户可以通过aurora系统前台页面查看由自己提交的各项任务的执行情况。效果如下：


|任务|描述|用户|执行环境|优先级|类型|SQL|处理文件路径|处理内容|开始时间|结束时间|异常信息|状态|
|:-|:-|:-|:---|:--|:-|:--|:-----|:---|:---|:---|:---|:-|
|生成excel|生成excel|1 |    |0  |JAVA|   |sys.create\_excel|    |2012-07-02|2012-07-02|    |完成|

# 用户使用 #
  * 启用后台任务处理器
> > ${web-home}\WEB-INF\aurora.feature中添加task.config文件，内容如下：
```
   <task:TaskHandler xmlns:task="aurora.application.task" threadCount="4" 
        oldTaskBM="db.sys_tasks_pkg.reset_unfinished_task_status" 
      fetchTaskBM="db.sys_tasks_pkg.get_task_with_count" 
     updateTaskBM="db.sys_tasks_pkg.update_task_running_status"  
     finishTaskBM="db.sys_tasks_pkg.finish_task">
</task:TaskHandler>
```
    * queryTaskBM是获取新任务的bm
    * finishTaskBM是执行完任务的bm
    * oldTaskBM是重启web服务器后执行上次意外中断的任务（状态既不是new，也不是done）。去掉这个属性，则不会执行上次意外中断的任务，但状态是new的，将会被执行。

  * 创建一个svc，内容如下：
```
<?xml version="1.0" encoding="UTF-8"?>
<a:service xmlns:msg="aurora.application.features.msg" xmlns:a="http://www.aurora-framework.org/application"
 xmlns:task="aurora.application.task" xmlns:excel="aurora.application.task.excel"
 xmlns:rs="aurora.database.rsconsumer" xmlns:ex="aurora.plugin.export.task" 
xmlns:mail="aurora.plugin.mail" xmlns:p="uncertain.proc" trace="true">
    <a:init-procedure>
        <task:async-task bm="db.sys_tasks_pkg.add_task" taskDescription="生成excel"
           taskName="生成excel" taskType="JAVA">
            <ex:ModelExportTask/>
            <p:switch test="/parameter/@sendToMail">
                <p:case Value="true">
                    <mail:AutoSendMail content="mail" title="test" tto="jinxiao.lin@hand-china.com">
                        <attachments>
                            <mail:attachment path="${/parameter/@file_path}"/>
                        </attachments>
                    </mail:AutoSendMail>
                    <excel:ExcelRemove path="${/parameter/@file_path}"/>
                </p:case>
                <p:case>
                    <a:model-insert model="rpt.RPT1060.rpt_task_reports"/>
                </p:case>
            </p:switch>
        </task:async-task>

        <msg:message-creator message="task_message" topic="task">
            <properties>
                <msg:property key="task_id" value="${/parameter/@task_id}"/>
                <msg:property key="cookie" value="${/request/@cookie}"/>
            </properties>
        </msg:message-creator>
    </a:init-procedure>
    <a:service-output output="/parameter/"/>
</a:service>
```

"bm"属性是指会把这些属性插入数据库的bm。其他属性都是数据库表SYS\_TASKS中的字段，只是名字进行了小驼峰命名法转换。