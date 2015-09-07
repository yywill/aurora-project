_本文档为临时解决方案，后面将有改动_


## 应用级日志 ##
修改`<WEB-INF>/uncertain.xml`，配置以下属性：

```
<uncertain-engine  logPath="/Users/logs" defaultLogLevel="FINE" name="Hand Application Platform" >
```

其中：
name是应用的名称，
`logPath`是日志文件存放的目录，日志文件将以`<应用名称><年月日>.log`的命名方式来保存。
`defaultLogLevel`是缺省的日志级别。


## Screen/SVC/Autocrud的日志 ##

在WEB-INF/目录下创建名为service-logging.config的文件，内容如下：
```
<service-logging xmlns="aurora.application.features" logPath="/u01/webapp/hap/logs" pattern="_${/session/@session_id}_" append="false" defaultLogLevel="FINE">
<!--
	<topics>
		<logging-topic name="uncertain.proc" level="CONFIG"/>
		<logging-topic name="aurora.presentation.buildsession" level="CONFIG"/>
		<logging-topic name="aurora.presentation.manager" level="CONFIG"/>
		<logging-topic name="aurora.database" level="CONFIG"/>
	</topics>
	-->
</service-logging>
```

其中：

logPath: 设置trace文件存放的目录

pattern: trace文件名的格式。如果加上`${/request/@address}`，将为每一个来自不同IP的请求创建单独的trace文件，否则按service文件名创建

defaultLevel: 缺省的日志级别。

根据调试的需要，可以分别将下面的topic的级别设置为WARNING, INFO, CONFIG, FINE等级别

然后，对需要生成trace文件的screen/svc文件，在顶层设置`trace="true"`属性。这样，就可以在logPath指定的目录，看到名为`<screen名><pattern设置的后缀><年月日>.log`的日志文件。

对于autocrud应用，先修改`WEB-INF/application.config`文件，在顶层设置`enableBMTrace="true"`属性。