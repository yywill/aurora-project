# 简介 #

Aurora中用开源框架Quartz来实现定时任务。支持定时调用java代码和Proc（等同于svc）文件。

# 部署 #
在项目jar目录下放置aurora-plugin.jar,并在${WEB-HOME}/WEB-INF/uncertain.xml文件的 **packages** 节点中添加元素：
```
<package-path classPath="aurora_plugin_package/aurora.plugin.quartz"/>
```

把配置好的内容写在${WEB-HOME}WEB-INF\aurora.plugin.quartz\job.config文件中

# 定时调用proc #

> ## 例子 ##
```
<?xml version="1.0" encoding="UTF-8"?>

<scheduler-config debug="true" xmlns="aurora.plugin.quartz" xmlns:qz="org.quartz">
    
    <jobs>
        
        <auroraJobDetail stateful="true" name="you_job_name" method="run" 
procedure="test.model_consumer" jobClass="aurora.plugin.quartz.ProcedureInvoke"/>
        
    </jobs>
    
    <triggers>
        
        <qz:simple-trigger name="every5sec" startTime="2012-01-01 00:00:00" 
repeatCount="-1" repeatInterval="5000"/>
        
    </triggers>
    
    <instances>
        
        <job-instance jobName="you_job_name" triggerName="every5sec"/>
        
    </instances>
    
</scheduler-config>

```
> ## 节点解释 ##
job-instance 表示一个定时任务实例，可以定义多个。它的jobName和triggerName分别对应jobs和triggers中name属性。
auroraJobDetail元素描述了要执行那个proc文件，simple-trigger元素描述了什么时候开始执行，以多快的频率重复定时执行。
auroraJobDetail中stateful="true"表示，在下次执行时间到来时，如果发现在上一个任务没处理完，就等它执行结束再开始执行，false则表示仍旧立即执行。
simple-trigger中repeatCount表示执行的次数，-1表示无限次。repeatInterval表示执行的频率，单位是毫毛。
## 例子详解 ##
上面这个例子中表示要从2012年1月1日开始（因为并非未来的某个时间，所以立即执行），每五秒调用执行一次test.model\_consumer文件，如果上次没执行完，则等待上次结束后再运行。
## proc文件例子和解释 ##
下面我们再来看下test.model\_consumer文件，它的完整路径是${WEB-HOME}/WEB-INF/classes/test/model\_consumer.proc,内容格式跟svc相同：
```
<?xml version="1.0" encoding="UTF-8"?>
<p:procedure xmlns:a="http://www.aurora-framework.org/application"  xmlns:rs="aurora.database.rsconsumer" 
xmlns:p="uncertain.proc" trace="true">
	<a:model-query fetchAll="true" model="test.sys_user_test">
		<a:consumer>
			<rs:ModelActionConsumerWrapper useTransactionManager="false">
				<a:model-insert model="test.account_test_temp"/>
			</rs:ModelActionConsumerWrapper>
		</a:consumer>
   </a:model-query>
</p:procedure>
```
唯一跟svc不同是，顶级节点是procedure。

# 调用java程序 #

> ## 例子 ##
```
<?xml version="1.0" encoding="UTF-8"?>

<scheduler-config debug="true" xmlns="aurora.plugin.quartz" xmlns:qz="org.quartz">
    
    <jobs>
        
        <auroraJobDetail stateful="true" name="you_job_name" method="you_method_name"
 
you_need_attr="you_setting_value" jobClass="you_packageName.you_className"/>
        
    </jobs>
    
    <triggers>
        
        <qz:simple-trigger name="every5sec" startTime="2012-01-01 00:00:00" 
repeatCount="-1" repeatInterval="5000"/>
        
    </triggers>
    
    <instances>
        
        <job-instance jobName="you_job_name" triggerName="every5sec"/>
        
    </instances>
    
</scheduler-config>

```

这个例子与上面的例子基本相同，只是auroraJobDetail中jobClass和method和其他属性不同。jobClass表示需要调用的java类的全名，method表示需要调用的方法，另外还可以定义运行这个类需要设定的变量参数。

> ## java编写要则 ##
> > 类的构造函数所依赖的参数要求是在aurora中已经注册和实例化的对象（即在IObjectRegistry中注册过），比如数据库连接工厂（IDatabaseServiceFactory）等，最好是无参数的构造函数。
> > 方法名默认调用时run，也可以自己设定。方法所依赖的输入参数的同样是需要在aurora中已经注册和实例化的对象，另外多加一个JobExecutionContext。


> ## 编写代码提示 ##
> > ### IObjectRegistry ###
> > > 通过SchedulerConfig.getObjectRegistry()来IObjectRegistry实例，再通过IObjectRegistry来获得需要的实例。

> > ### 获得自定义属性的内容 ###
```
public void run(JobExecutionContext context) throws Exception {
  AuroraJobDetail detail = (AuroraJobDetail) context.getJobDetail();
  CompositeMap config = detail.getConfig();
  //获得自定义属性的内容
  String you_setting_value= config.getString("you_need_attr");
  。。。。
```

