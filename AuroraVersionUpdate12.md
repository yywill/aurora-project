更新jar之后，原有应用系统需做以下更新：

1. 将uncertain.xml更新为以下内容
```
<?xml version="1.0" encoding="UTF-8"?>
<uncertain-engine name="hec">
	<packages>
		<package-path classPath="aurora_plugin_package/aurora.plugin.jms"/>
		<package-path classPath="aurora_plugin_package/aurora.plugin.memcached"/>
		<package-path classPath="aurora_plugin_package/aurora.plugin.dataimport"/>
		<package-path classPath="aurora_plugin_package/aurora.plugin.export"/>
	</packages>
</uncertain-engine>
```

其中，packages部分设置要使用的系统功能包的路径，例如，如果要使用JMS功能，就需要加载`aurora_plugin_package/aurora.plugin.jms`；如该要使用memcached，就加载`aurora_plugin_package/aurora.plugin.memcached`

2. 创建uncertain.local.xml文件，用于配置与本地安装相关的信息
```
<?xml version="1.0" encoding="UTF-8"?>
<uncertain-engine defaultLogLevel="INFO">
	<path-config logPath="/Users/zhoufan/logs" uiPackageBasePath="/Users/zhoufan/Work/workspace/AuroraUI/src" /> 
</uncertain-engine>
```

其中，logPath表示log文件的存放目录，uiPackageBasePath表示Aurora标准UI包的安装目录。另有basePath属性表示应用的主目录，由Web应用启动类自动设置。

3. 修改aurora.config，在路径配置部分，用`$`标记替换原来的绝对路径：

```
	<p:presentation-manager xmlns:p="aurora.presentation">
		<packages>
			<p:package-path path="${uiPackageBasePath}/aurora.ui.std" />
			<p:package-path path="${basePath}/WEB-INF/ui.template" />
		</packages>
	</p:presentation-manager>	
```

4. 修改service-logging.config，删掉其中的logPath属性