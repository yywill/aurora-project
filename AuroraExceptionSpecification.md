## 概述 ##

当框架抛出异常时，为便于应用开发人员判断错误的原因，异常信息应尽可能多地自我解释，让开发人员能明白这个异常是怎么回事，为什么会发生，应该怎样处理。为此，Aurora框架内的异常应该做到：
  1. 便于追溯。Aurora是一个面向配置的框架，所以相当多的异常可以追溯到配置源文件。
  1. 异常信息支持多语言。如果异常信息是一段容易理解的中文内容，很多时候应用开发人员就可以自己解决问题。
  1. 精准分类。通过唯一编码，能够准确地在用户、应用开发人员及框架开发人员之间交流异常的准确信息，以便解决问题。有了异常代码，用户或应用开发人员自己就可以查到异常发生的原因及解决方法；如果只是一个包含一段描述信息的RuntimeException，问题就可能需要框架开发人员介入才能解决，而且往往可能是必须由原作者来解决。

以下逐条说明，框架开发者应如何设计异常。

## 多语言 ##
原则上，任何异常信息都应支持多语言，在使用时通过代码来获取当前语言环境下的异常信息。
异常多语言的实现采用JDK的标准多语言机制，将异常信息保存在property文件中，按JDK标准命名规范添加各种语言的Locale后缀。为便于维护、使用大量的异常信息，Aurora框架做以下约定：
  1. 所有异常信息的property文件，应位于一个统一的包名：resources之下。这样，当需要将异常信息翻译为一种新的语言时，可以在每一个项目的resources目录直接找到所有文件。
  1. 原则上每一个package定义一个自己的property文件，文件名为包名，将'.'替换为'_'，再加\_exceptions后缀。
例如，Aurora展示层的异常信息文件名为：
```
resources/aurora_presentation_exceptions.properties
```
属于同一个模块的package，可以共用一个exception property文件。_

### 多语言信息存取的Java API ###

在Aurora框架中，统一通过uncertain.exception.MessageFactory这个类来加载多语言信息，及获取某个代码对应的多语言信息。其中：`loadResource( String property_file_name)`静态方法将某个异常信息property文件的内容加载到内存中；`getMessage( String code, Object[] args)`静态方法获取某个代码对应的多语言信息。

例如，在上面的property文件中定义了：
```
aurora.presentation.component.screen_include_invoke_error=Error when invoking included screen: {0}
```

在aurora展示层的入口类aurora.presentation.PresentationManager中，通过类级的静态代码块，加载这个property文件：

```
    static {
        MessageFactory.loadResource("resources.aurora_presentation_exceptions");
    }
```

在需要使用这个异常代码时：

```
   String msg = MessageFactory.getMessage(
     "aurora.presentation.component.screen_include_invoke_error", 
     new Object[]{ "a.screen" } );
```

就可以获得如下异常信息：
```
Error when invoking included screen: a.screen
```

每个异常信息property文件，都应该设计一个合适的类，在初始化时加载这个文件，以确保后面引用其中内容的类，能正确获取加载后的信息。

## 异常代码 ##
如前所述，实现多语言时，已经需要为每个异常信息定义一个代码。在Aurora框架中，异常自己的代码就与异常信息代码一致。在前面的例子中，`aurora.presentation.component.screen_include_invoke_error`这个代码就代表在页面中包含另一个screen文件时出错，可以此代码在相应的文档中检索异常的详细信息。

异常代码的设计应遵循以下约定：
  * 以使用类的包名作为前缀。
  * 每个代码必须全局唯一。
  * 跟在包名之后的代码名，应该是该异常的简要描述的英文词组，以下划线分隔单词。

## 源文件定位 ##
在Aurora框架中，定义了一个接口，来抽象一切可以提供源文件来源信息的对象：
```
package uncertain.util.resource;

public interface ILocatable {
    
    public Location getOriginLocation();
    
    public String   getOriginSource();

}
```

其中，getOriginSource()返回源文件资源名；getOriginLocation()返回一个uncertain.util.resource.Location对象，能标识在源文件中的位置。如果错误能追溯来来源文件，那么应抛出实现此接口的异常。

特别的，当通过O/C Mapping机制，通过CompositeMap映射到Java对象时，CompositeMap本身已经包含了来源文件及位置信息，Java对象可实现uncertain.ocm.IConfigurable接口，在beginConfigure()方法中接收CompositeMap，读取其中的位置信息，保存在自己的field中，并实现ILocatable接口，以便今后提供位置信息。例如，uncertain.proc.AbstractEntry类是大多数工作流中的entry类的基类，其中：

```
public abstract class AbstractEntry implements IEntry, IConfigurable, ILocatable {
    ...
    protected String    source;
    protected Location  location;

    public void beginConfigure(CompositeMap config){
        source = config.getSourceFile()==null?null:config.getSourceFile().getAbsolutePath();
        location = config.getLocation();
    }
    public void endConfigure(){
        
    }
    
    public Location getOriginLocation(){
        return location;
    }
    
    public String getOriginSource(){
        return source;
    }
   
   ...
```

这样，当它的子类需要抛出异常时，就可将自己作为ILocatable实例传递给异常类的构造函数，以传递位置信息。

## 异常信息格式化 ##
通过uncertain.exception.MessageFactory.getExceptionMessage() 静态方法，可以为exception信息添加标准的前缀，如异常代码，异常产生的源文件位置等。通常，在自定义的exception中，可以重载getMessage()方法，调用MessageFactory.getExceptionMessage()，来创建标准格式的异常信息。例如：
```
    public String getMessage() {
        String msg = super.getMessage();
        return MessageFactory.getExceptionMessage(this, msg);
    }
```
调用此方法时，需要将原始exception message作为参数传递。为避免死循环，MessageFactory不会直接调用exception的getMessage()。

## 标准异常 ##
uncertain.exception包中定义了以下标准异常：

```
java.lang.Exception
   +--uncertain.exception.BaseException

java.lang.RuntimeException
   +--uncertain.exception.BaseRuntimeException
         +--GeneralException
         +--ConfigurationFileException
```

|异常|用途|
|:-|:-|
|BaseException|实现ICodedException, ILocatable，重载getMessage()以实现标准异常信息输出。这个类可以作为其它自定义异常的基类。这是抽象类，不能被实例化。|
|BaseRuntimeException|同BaseException，只是它由RuntimeException派生而来，可作为不需要显示catch的exception的基类。|
|GeneralException|用于纯描述性、不需要在java代码中通过不同异常类型来分别catch的异常。MessageFactory.createException()是创建此异常的静态工厂方法。|
|ConfigurationFileException|专门用于表述配置文件错误的异常信息。所有由于配置文件错误导致的错误，都应抛出此异常。|

## 异常代码的封装 ##
对于经常使用的异常代码，uncertain.exception.BuiltinExceptionFactory提供了一些静态方法用于更加方便地构造。例如，createAttributeMissing()方法返回必填属性没有填写的异常：
```
    public static ConfigurationFileException createAttributeMissing( ILocatable locatable, String attrib_name ){
        return new ConfigurationFileException(
   "uncertain.exception.validation.attribute_missing", 
   new Object[]{attrib_name}, 
   null, 
   locatable);
    }
```

## 总结 ##

在Aurora框架中，异常的定义及使用的基本步骤：

  1. 按前述命名规范创建一个property文件，定义本模块的所有异常信息；
  1. 为异常指定一个全局唯一的代码，并在property文件中定义其对应的信息内容；
  1. 如不需要为这个异常创建特定的java类，可直接使用某个MessageFactory.createException()方法，传递前面定义的代码，创建一个支持多语言的GeneralException并抛出。如有可能，也可传递一个ILocatable对象（ 如CompositeMap.asLocatable())，以记录异常对应的源文件位置。
  1. 如果错误来源于配置文件，应创建uncertain.exception.ConfigurationFileException实例，传递来源文件位置或配置对应的CompositeMap，并抛出此异常。
  1. 如果需要为这个异常单独创建java类，可选择BaseException或BaseRuntimeException作为基类。如果需要完全自己构造，请注意实现ICodedException，ILocatable接口，并调用MessageFactory.getExceptionMessage()方法来创建标准的exception信息。
  1. 对于可能在多处使用的异常代码，需要仿照uncertain.exception.BuiltinExceptionFactory，提供静态方法创建其实例。

## 示例 ##

`uncertain.proc.Set`对象实现`<set>`标记。在run()方法中，执行实际功能之前，先检查必要的属性是否设置。如果没有，就抛出异常：

```
    public void run(ProcedureRunner runner) {
        // 检查field属性是否设置
        if(field==null)
            throw BuiltinExceptionFactory.createAttributeMissing(this, "field");
        // 检查sourceField或value属性之一是否设置
        if(sourceField==null && value==null)
            throw BuiltinExceptionFactory.createOneAttributeMissing(this, "sourceField,value");
         ...
```

BuiltinExceptionFactory.createAttributeMissing()会获取预定义在<Uncertain项目>/resources/UncertainBuiltinExceptions.properties中定义的，代码为uncertain.exception.validation.attribute\_missing的异常信息。在中文环境下，会产生这样的异常：

```
HTTP Status 500 -

type Exception report

message

description The server encountered an internal error () that prevented it from fulfilling this request.

exception

javax.servlet.ServletException: uncertain.exception.ConfigurationFileException: 异常代码：uncertain.exception.validation.attribute_missing 源文件:/Users/zhoufan/Work/workspace/HAP2010/HAP2010/web/footer.screen, 第12行, 第17列 Attribute 属性"field"不能为空。请检查源文件，设置这个属性。
	aurora.service.http.FacadeServlet.handleException(FacadeServlet.java:70)
	aurora.service.http.AbstractFacadeServlet.service(AbstractFacadeServlet.java:131)
	javax.servlet.http.HttpServlet.service(HttpServlet.java:722)
root cause

uncertain.exception.ConfigurationFileException: 异常代码：uncertain.exception.validation.attribute_missing 源文件:/Users/zhoufan/Work/workspace/HAP2010/HAP2010/web/footer.screen, 第12行, 第17列 Attribute 属性"field"不能为空。请检查源文件，设置这个属性。
	uncertain.exception.BuiltinExceptionFactory.createAttributeMissing(BuiltinExceptionFactory.java:13)
	uncertain.proc.Set.run(Set.java:65)
...
```