## 概述 ##

与BM权限控制相关的接口：
`aurora.bm.IBusinessModelAccessChecker` 针对一个BM，返回是否能执行指定的操作
```
public boolean canPerformOperation( String operation );
```
`aurora.bm.DefaultAccessChecker`是这个接口的缺省实现，通过一个set来构造，如果set中包含指定的operation，就返回true。大多数情况下使用这个实现即可。

`aurora.bm.IBusinessModelAccessCheckerFactory` 根据当前service的context及请求访问的BM，返回一个前面的IBusinessModelAccessChecker实例，用于判断权限。
```
    public IBusinessModelAccessChecker getChecker( String model_name, CompositeMap session_context ) throws Exception;
```

## BM权限控制模型 ##
BusinessModel中，通过设置accessControlMode属性，来控制BM访问权限检查的方式
```
  "none": 无控制，可被任何人访问
  "separate": 此BM进行独立的权限控制
  "default": 缺省模式，如果BM由其他BM派生而来，则向上找父级BM，直至根节点，或者找到一个设置为separate模式的父级BM
```

通常在应用程序中，将BM权限分配到某个具体的功能下，再将功能分配给角色，从而控制某个角色的用户是否能对某个BM进行特定操作。

## BM批量操作中的权限判断 ##

对BM执行batch\_update时，该操作本身总是被允许的，实际的权限控制是在执行中，针对参数传入的每一条记录，根据该记录要执行的operation（通常来自于记录的\_status字段），再来判断是否有操作权限。

为此，需要为应用程序配置一个全局实例，实现`IBusinessModelAccessCheckerFactory`接口，供执行batch\_update时调用。

## Autocrud servlet中的权限校验 ##

AutoCrudServlet会在执行之前，在context中设置以下变量：
```
is_autocrud_service="true"
requested_bm_name=当前请求的BM名
requested_operation=当前请求的操作
```
在service-procedure.config中，再配置相应的流程，执行权限检查，如果不成功，就设置context中相应的参数。