### 第1步 Hello World ###

下面是一个最简单的例子，我们将创建一个组件，并让它在APF的架构中产生输出。

```
package aurora.testcase.presentation;

import java.io.IOException;
import java.io.PrintWriter;
import java.io.Writer;

import uncertain.composite.CompositeMap;
import aurora.presentation.BuildSession;
import aurora.presentation.IViewBuilder;
import aurora.presentation.PresentationManager;
import aurora.presentation.ViewComponent;
import aurora.presentation.ViewComponentPackage;
import aurora.presentation.ViewContext;
import aurora.presentation.ViewCreationException;

/**
 * Basic view demo 
 * @author Zhou Fan
 *
 */
public class HelloWorld implements IViewBuilder{
    
    /** 实现buildView方法，创建界面内容 */
    public void buildView( BuildSession session,  ViewContext view_context ) 
        throws IOException, ViewCreationException
    {
        // 从view中获取color属性
        CompositeMap view = view_context.getView();
        String color = view.getString("color");

        // 从model中获取需要显示的字段
        CompositeMap model = view_context.getModel();
        String field = view.getString("field");
        String greeting = model.getString(field);
        
        // 从BuildSession中获得用于输出的Writer
        Writer out = session.getWriter();
        out.write("<span color='"+color+"'>Hello, " + greeting + "</span>");
    }

    /** 此方法在本例中暂无须实现 */
    public String[] getBuildSteps( ViewContext context ){
        return null;        
    }
    
    public static void main(String[] args) throws Exception {
        /// 创建PresentationManager——界面组件的管理者
        PresentationManager pm = new PresentationManager();
        // 创建一个ViewComponent，将<hello>标记与HelloWorld类关联在一起
        ViewComponent component = new ViewComponent(null, "hello", HelloWorld.class);
        // ViewComponent通过ViewComponentPackage组织在一起
        ViewComponentPackage pkg = new ViewComponentPackage();
        pkg.addComponent(component);
        // 将刚刚创建的ViewComponentPackage注册到PresentationManager中
        pm.addPackage(pkg);
        
        // 创建包含数据的model，设置greeting属性
        CompositeMap model = new CompositeMap("data");
        model.put("greeting", "world");
        // 创建hello组件的配置，设置color属性
        CompositeMap view = new CompositeMap("hello");
        view.put("color", "red");
        view.put("field", "greeting");

        // 创建一个Writer实例，用于输出界面内容
        PrintWriter out = new PrintWriter(System.out);
        
        // 通过PresentationManager创建BuildSession，这是整个界面创建
        BuildSession session = pm.createSession( out );

        // 完成界面内容的创建
        session.buildView(model, view);
        out.flush();
        
    }   

}

```

这个例子演示了APF的基本概念：

  * 我们创建了一个HelloWorld组件，它有一个color属性，可以设置生成的文字的颜色；
  * 需要显示的内容，也就是MVC中的Model，以CompositeMap的形式进行传递；
  * HelloWorld组件本身的属性也是通过CompositeMap来配置；
  * 界面组件与Model层通过属性设置，进行运行时期绑定（本例中，通过field属性，告诉HelloWorld组件从model中取哪个字段进行显示），view与model层是完全分离的；
  * 所有的配置都可以在运行时期生成、修改。

![http://app.hand-china.com/download/aurora/APFDG1.1.jpg](http://app.hand-china.com/download/aurora/APFDG1.1.jpg)