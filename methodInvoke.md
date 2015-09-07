## 简介 ##

Aurora提供了此功能，可以在svc的init-procedure或者screen的init-procedure标签下直接调用类的某个方法。


## 功能介绍 ##
  * 对类和方法的支持：
    * 可以直接调用类的公用静态方法，模板如下：
```
   <p:method-invoke xmlns:p="uncertain.proc" className="my.pkg.ClassWithStaticMethod"
 methodName="staticMethod">
       <p:arguments>
           <p:argument type="int" value="value containing ${@tag} />
           <p:argument type="long" path="/parameter/path_to_parameter" />
       </p:arguments>
   </p:method-invoke>
```
    * 对于非静态方法，目前支持所有已经在aurora实例注册器（uncertain.ocm.IObjectRegistry）中注册过的实例，模板如下：
```
      <p:method-invoke xmlns:p="uncertain.proc" instanceType="my.pkg.IRegisteredInterface" 
methodName="anyMethod" resultPath="/model/result/@status" >
       <p:arguments>
           <p:argument type="int" value="value containing ${@tag}" />
           <p:argument type="long" path="/parameter/path_to_parameter" />
       </p:arguments>
   </p:method-invoke>
```
  * 返回值
> > 在resultPath中定义返回值。
  * 参数定义
    * 参数类型用type定义，基本类型直接写，譬如 int，long等；对象类型写全类名，譬如java.lang.String、uncertain.ocm.IObjectRegistry等。
    * 参数值支持两种，value是直接写死的参数，但可以支持tag标签。path是指从当前context中获得相应内容，譬如path="/paramter"就是获得当前的传入的参数。
    * 高级功能，支持获取当前aurora应用的实例注册器或者已经在注册器中注册过的任何实例。此时type写ncertain.ocm.IObjectRegistry或者此实例的注册主键（通常是此实例的接口），譬如uncertain.logging.IPerObjectLoggingConfig。此时内容固定为path="instance"。例子：
```
 <a:init-procedure xmlns:a="http://www.aurora-framework.org/application">
        <a:model-query defaultWhereClause="HEAD_ID=1 and SOURCE_FILE=&apos;modules/sys/sys_user.screen&apos;"
 model="sys.sys_config_customization" rootPath="db"/>
        <p:method-invoke className="aurora.application.sourcecode.CustomSourceCode" 
methodName="custom" resultPath="/model/@result">
            <p:arguments>
                <p:argument path="instance" type="uncertain.ocm.IObjectRegistry"/>
                <p:argument type="java.lang.String" value="modules/sys/sys_user.screen"/>
                <p:argument path="/model/db" type="uncertain.composite.CompositeMap"/>
            </p:arguments>
        </p:method-invoke>
</a:init-procedure>

```
