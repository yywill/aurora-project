## 概述 ##

启用防重复提交，可避免因客户端在前次请求还没结束时，又提交新的请求，从而造成的重复数据或事务不一致错误。

## 配置说明 ##

在WEB-INF下创建service-lock.config文件，内容为：

```
<session-lock-checker xmlns="aurora.service.lock" defaultCheckAll="true" 
	errorMessage="PROMPT.SERVICE_IN_LOCK" 
	sessionKey="${/session/@session_id}"
/>
```

该配置文件的说明：
| 属性 | 说明 |
|:---|:---|
|defaultCheckAll | 是否缺省对所有svc都执行防重复请求检查，如果service没有单独设置。 |
|errorMessage | 如果发生重复请求，返回给客户端的JSON错误信息的多语言代码。缺省为`PROMPT.SERVICE_IN_LOCK` |
|sessionKey | 判断是否同一session的缺省表达式，支持${}。 |

如果上述文件设置为defaultCheckAll="true"，那么系统中所有的svc都支持按session防重复提交。如果还
需要更细的控制，可以在svc文件中设置以下属性：

```
<a:service checkSessionLock="true"  
lockKey="${/session/@role_id}.${/session/@org_id}"
lockService="other_control.svc" lockErrorMessage="当前公司的缺料检查还在执行，请勿重复提交！">
```

service级的配置属性说明如下：
| 属性 | 说明 |
|:---|:---|
|checkSessionLock | 单独控制该service是否启用防重复提交，覆盖全局文件的缺省配置 |
|lockKey | 设置不同的锁定控制维度。如果某些特殊功能不是按session，而是特殊业务逻辑去防止重复提交，则用该属性设置用于控制的表达式。例如按角色+组织控制防重复提交，可以设置成 `lockKey ="${/session/@role_id}.${/session/@org_id}"` |
|lockService|缺省情况下以当前被执行的service的名字来执行锁定。用该属性可以设置不同的锁定请求名称控制逻辑，以实现“如果A请求没有执行完毕，则B请求也不能被提交”这样的需求。|
|lockErrorMessage |如果检测到重复提交，显示给客户端的错误信息 |

## 实现原理 ##
  1. 对客户端提交的请求，以lockKey + lockService生成唯一标志字符串，判断该标志是否已有锁。
  1. 如果没有锁，以对该标志加锁，正常往下执行请求，执行结束（不论是否有异常发生），解锁。
  1. 如果已有锁，返回错误信息，停止请求的执行过程。

可用下面的test.service文件进行测试，该页面会制造一个10秒的延时再产生正常输出：

```
<?xml version="1.0" encoding="UTF-8"?>
<a:service xmlns:a="http://www.aurora-framework.org/application" xmlns:p="uncertain.proc">
  <a:init-procedure>
    <p:sleep time="10000" />
  </a:init-procedure>
</a:service>
```

## 注意事项 ##
  1. 启动防重复提交时，如果是在应用服务器集群环境下，应配置为每个客户端都被固定在一个应用服务器节点上。否则，如果用户上次在A服务器提交请求，下次再去B服务器提交请求，B服务器也会认为不是重复提交。
  1. 使用Chrome浏览器测试时，如果在两个tab页分别输入同一地址，Chrome自己会控制第一个tab页得到响应后再执行第二个tab页的请求，看起来好像防重复提交没有生效。但如果是在同一页通过地址栏按回车来重复请求，就可以看到正确的效果。其他浏览器似乎无此限制。

## JMX支持 ##
可通过JMX来监控应用服务器内的请求锁。在路径`org.uncertain/<应用名>/Session/ServiceSessionLock`下，可看到该MBean。可通过lockCount属性查看瞬时的请求锁数量，通过showAllLocks()方法查看所有的锁，并可通过clear()方法来手工清除所有的锁。