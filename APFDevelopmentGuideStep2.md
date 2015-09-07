## 第2步 使用Package进行配置 ##

在前面的例子中我们看到，使用一个新开发的控件，需要做一定的配置。通过coding虽然可以解决问题，但这样会比较繁琐，不利于分发部署。在本例中我们将使用配置文件的方式，精简配置过程。

### 2.1 目录结构配置 ###

在APF中，界面组件和java class类似，是以package来组织的。我们首先创建一个这样的目录结构：
aurora/testcase/ui
这将对应名称为”aurora.testcase.ui”的package。然后，在下面分别创建以下目录：
  * config：这里将放置package相关的配置文件。
  * theme：APF支持界面风格主题的切换，这里将放置不同主题各自的资源文件。
  * theme/default：缺省主题的资源文件，在本例中我们只提供一种风格，我们的资源文件将存放在这个目录中。
  * theme/default/resource：这里将存放缺省主题的Web资源文件，如样式表，js，图片等等。
  * theme/default/template：这里将存放控件的模版文件。在本例中，我们将使用模版来实现界面内容。

上述步骤完成后，目录结构将如下所示：

```
aurora
   +---- testcase
            +----- ui
                    +--- config
                    +--- theme
                            +--- default
                                    +---- resource
                                    +---- template
```

### 2.2 使用模版创建组件 ###

首先，我们在aurora/testcase/ui/config/目录下，创建一个名为components.xml的文件，内容为：

```
<package>
	<components>
		<view-component elementName="hello" builder="aurora.presentation.TemplateBasedView" />		</components>
</package>
```

这样我们就将”hello”这个标记和APF内建的TemplateBasedView关联在一起，以示该组件将使用基于模版的方式来创建。该package下面的其他组件，也是用类似的方式在

&lt;components&gt;

部分进行配置。

然后，在aurora/testcase/ui/theme/default/template/目录下，创建一个名为hello.tplt的模版文件，内容为：

```
<span color='${color}'>
Hello, ${value}
</span>
```

这里预留了两个标记：${color}和${value}，它们将被替换成组件动态产生的内容。

然后，创建下面的java class：

```
package aurora.testcase.presentation;

import java.util.Map;

import uncertain.composite.CompositeMap;
import aurora.presentation.BuildSession;
import aurora.presentation.ViewContext;

/**
 * Using template to create UI content 
 * @author Zhou Fan
 */
public class HelloWorldRenderer {
    
    public void onCreateViewContent( BuildSession session, ViewContext view_context ){
       
        // 从view中获取color属性
        CompositeMap view = view_context.getView();
        String color = view.getString("color");

        // 从model中获取需要显示的字段
        CompositeMap model = view_context.getModel();
        String field = view.getString("field");
        String greeting = model.getString(field); 
        
        // 将动态内容放入ViewContext的Map中，后面将用于替换模版中的同名标记
        Map content_map = view_context.getMap();
        content_map.put("color", color);
        content_map.put("value", greeting);
    }

}

```

这个class将会创建我们在模版中标记的动态内容。为了将该class与”hello”标记关联在一起，我们需要在aurora/testcase/ui/config/下面创建名为class-registry.xml的配置文件，内容为：

```
<class-registry>
	<feature-attach elementName="hello" featureClass="aurora.testcase.presentation.HelloWorldRenderer" />
</class-registry>
```

至此，package及组件的配置工作已经完成，下面我们写一个main方法来测试：

```

/*
 * Created on 2009-7-14
 */
package aurora.testcase.presentation;

import java.io.IOException;
import java.io.PrintWriter;
import java.net.URL;

import uncertain.composite.CompositeMap;
import uncertain.core.UncertainEngine;
import aurora.presentation.BuildSession;
import aurora.presentation.PresentationManager;

public class TemplateTest {

    /**
     * Test template based view creation
     */
    public static void main(String[] args) 
        throws Exception
    {
        // APF初始化
        UncertainEngine engine = UncertainEngine.createInstance();
        PresentationManager pm = new PresentationManager(engine);
        
        // 获取aurora/testcase/ui的当前物理路径
        URL url = Thread.currentThread().getContextClassLoader().getResource("aurora/testcase/ui");
        if(url==null)
            throw new IOException("aurora/testcase/ui is not found in CLASSPATH");
        String path = url.getPath();
        // 根据获取的路径，装载组件package
        pm.loadViewComponentPackage(path);
        
        /* 以下和 Step 1 类似 */
        
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