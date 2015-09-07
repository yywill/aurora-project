## 系统权限校验更新（临时版） ##

  * 更新aurora框架
  * 增加以下jar文件(SVN aurora-plugin/dependency目录)：

```
activemq-core-5.4.2.jar
geronimo-j2ee-management_1.1_spec-1.0.1.jar
geronimo-jms_1.1_spec-1.1.1.jar
spymemcached-2.7.jar
```

  * 更新WEB-INF目录的以下文件：
```
0.cache.config
amq.config
bm-access.config
response-cache.config
service-listener.config
service-procedure.config
```

  * 修改amq.config中的activemq服务IP及端口
  * 在uncertain.xml中增加以下内容：
```
        <package-mapping packageName="aurora.security" />
        <package-mapping packageName="aurora.plugin.memcached" />
	<package-mapping packageName="aurora.plugin.jms" />
	<package-mapping packageName="aurora.plugin.amq" />

```

  * 在aurora.config中增加以下内容（与presentation-manager并列）：
```
	<ApplicationStartupProcedureInvoker xmlns="aurora.application.features" />
    
    <default-session-info-provider xmlns="aurora.application" 
    			userIdPath="/session/@user_id" 
    			userLanguagePath="/session/@lang" />
    
    <cache-based-resource-access-checker xmlns="aurora.security" 
    			resourceCacheName="SystemResourceConfig" 
    			accessCacheName="RoleServiceAccess" 
    			accessCacheKeyPrefix="${/session/@role_id}." 
    			loginFlag="login_flag"
    			accessCheckFlag="access_flag"/>

```

  * 更新以下BM
```
init 全目录
sys/sys_service_for_init.bm
sys/sys_user_login_with_userid.bm
```

  * 更新以下screen/svc
```
login.svc
role_select.svc
logout.svc
modules/sys/reload_priviledge.svc
modules/sys/reload_service.svc
modules/sys/reload.screen
```
同时注册reload\*系列的screen/svc，定义新功能“Cache数据刷新”并将这三个文件分配到该功能下

  * 将以下screen的is\_access\_check设置为0
```
	logout.svc
	sys_lov.svc
	sys_lov.screen
	role_select.screen
	wellcome.screen
	loading.screen
	main.screen
```

  * 所有不需要分配也能访问的BM，设置属性

&lt;model needAccessControl="false"&gt;

