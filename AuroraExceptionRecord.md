## 概述 ##
一个上线运行的系统，如果发生内部异常，通常我们希望能够事后得到尽可能多的信息去还原现场，定位错误所在。Aurora在处理请求时，使用CompositeMap保存绝大多数的请求信息及中间处理环节产生的数据，因此天然就具有很强的现场还原能力。

## 实现方式 ##

1. 定义一个处理异常的接口：
```
package uncertain.exception;

/**
 *  Invoked by framework to save exception info.  
 */
public interface IExceptionListener {
    
    /** This method must guarantee no more exception would be thrown */ 
    public void onException( Throwable exception );

}
```

2. 设计一个全局对象，实现此接口，并在UncertainEngine中注册。如果是保存到数据库，可能需要配置数据库的表结构，创建异常的sql操作等信息。例如，可以设计一个这样的配置文件：

```

<exception-database-log>
       <!-- 定义哪些异常是可以忽略的 -->
       <ignored-types>
            <ignored-type name="uncertain.core.ConfigurationException" />
            <ignored-type name="uncertain.exception.GeneralException" />
       </ignored-types>
       
       <!-- 定义创建异常记录的SQL语句 -->
       <insert-sql>
       begin
              insert into fnd_exception log ( id, creation_time, exception_type, exception_message, stack_trace, context )
              values (fnd_exception_s.nextval, sysdate, ?, ?, ?, ? ) returning id into ?;
       end;
        </insert-sql>
</exception-database-log>

```

3. Aurora框架处理客户端请求的最初入口，来自于aurora.service.http.AbstractFacadeServlet。在service()方法的try...catch...finally部分，对于捕获到的任何异常，通过UncertainEngine获取IExceptionListener实例，调用其onException()方法记录异常。