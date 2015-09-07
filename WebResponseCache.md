## 概述 ##

全页面缓存可以达到最好的性能。通过将整个页面的输出内容加以缓存，支持全页面缓存的界面，其后台开销只有及少量配置检查代码，及Web服务器与Cache服务器之间的网络传输，性能接近静态页面。

如果因为界面内容比较动态，无法方便地实现全页面缓存，也可以对部分页面内容进行缓存，减少这部分内容渲染的开销。当然，网页的性能瓶颈通常不在于界面渲染，而在于数据库存取之类更消耗资源的操作。所以，在决定是否启用页面缓存，以及如何缓存时，要仔细考虑所启用的缓存是否确实解决了整个页面的性能短板。

## 页面缓存的配置 ##

在WEB-INF/中创建response-cache.config文件，其内容为：

```
<response-cache-provider xmlns="aurora.application.features" 
                   responseCacheName="ResponseCache"               
                   responseCacheKeyPrefix="${/session/@lang}.${/session/@theme}" />
```

其中：

responseCacheName设置用于存放所有页面输出内容的cache的名称。注意：由于页面输出的失效机制与文件修改时间关联，每次源文件修改后，会将新的内容以一个新的key写入cache，而不会主动删除原有文件在cache中的内容，所以必须配置为使用memcached这样的能自动清除长期不用内容的cache实现。

responseCacheKeyPrefix设置所有页面输出内容的缺省的key前缀。详细意义在后文加以解释。

# 在service-listener.config文件中，增加一行
```
        <participant class="aurora.application.features.CachedScreenListener"/>
```

## 页面cache key的公共结构 ##

在使用页面cache之前，首先要考虑该页面的cache key如何设计。也就是说，如何通过一个独一无二的字符串，来找到这个页面所对应的输出内容。Cache key必须包含所有可能导致cache内容失效的因素，例如，首先要包含文件名，这是能将不同页面文件区分开的最直接的因素；如果源文件发生了修改，cache内容必须失效，所以cache key中还应包含修改时间；如果这个页面包含跟当前用户登录角色有关的动态内容，例如菜单项，那么cache key还应该包含当前用户的角色id。

有一些因素是所有页面都相同的，包括：
**文件名** 文件修改时间
**当前用户所选的语言** 当前用户所选的界面主题
等等。文件名和修改时间会由框架自动拼接，不需要额外设置。其它的公共的key结构，可以在前面一节所说的response-cache.config文件中的responseCacheKeyPrefix属性来配置。例如：
```
responseCacheKeyPrefix="${/session/@lang}.${/session/@theme}"
```
表示，所有页面缓存的key，都应添加当前session的语言和主体两个变量，作为前缀。

假设用户访问a.screen文件，该文件的修改时间（以long表示）是12345，当前登录的语言是ZHS，界面主题是default，那么这个界面的cache key前缀就是：
```
<实际物理路径>/a.screen.12345.ZHS.default
```

假设源文件被修改，最后修改日期变为12346，那么下次访问这个界面时，cache key变为
```
<实际物理路径>/a.screen.12346.ZHS.default
```

由于找不到和这个key对应的输出内容，这个界面会被重新渲染，并将新的内容写入cache，自然而然地发生cache失效。


## 自定义页面cache key ##

配置好页面缓存cache key的公共结构之后，就可以在每个screen/svc文件中配置这个文件自己的key内容。例如：

```
<screen cacheEnabled="true" cacheKey="${/session/@user_id}.${/parameter/@product_id}" />
```

cacheEnabled设置是否启用页面输出缓存。cacheKey设置这个页面自己的cache key内容。上面的例子表示，该screen启用页面输出cache，并以当前用户id，以及来自参数的product\_id, product\_version两个参数联合起来作为key。还是以前面的a.screen为例，假设用户1001访问这个界面，传递的参数为product\_id=P1111，那么最终生成的key为：

```
<实际物理路径>/a.screen.12346.ZHS.default.1001.P1111
```

也就是说，这个界面对于不同的用户，以及不同的产品，都会产生不同的输出。但只要用户确定，产品确定，那么输出内容是确定的，可以从cache中获取。

## 局部页面内容缓存 ##

首先，在UI package的components.xml中增加组件配置：
```
        <view-component elementName="cached-part" 
                      nameSpace="http://www.aurora-framework.org/application" 
                      builder="aurora.presentation.component.CachedPart" />
```

然后，在screen文件中，需要进行部分缓存的地方，使用

&lt;cached-part&gt;

组件：
```
        <a:cached-part cacheKey="PageBody">
             ... 以下可包含任意组件 ...
             <a:grid>
             <a:tree>
             ...
        </a:cached-part>
```

其中，cacheKey必须设置，并且必须全页面唯一，以便能定位这个需要缓存的局部区域。在进行实际cache存取的时候，还会拼接整个screen的cacheKey，以便将不同页面的同名区域区分开。
仅当某个页面区域渲染需要耗费较多时间的时候，使用局部区域缓存才有意义。通常对大多数页面来说，由于瓶颈不在页面内容渲染，没有必要使用这个组件。

## 何时使用页面缓存 ##

首先，如前所述，页面的cache key必须经过仔细设计，确保其包含所有能导致cache失效的因素。

对于大多数基于AJAX的查询、维护类界面来说，如果页面内容只包含纯html和javascript，不包含与数据有关的动态内容，所有动态数据交互都是以AJAX模式来进行，那么可以很方便地进行cache，甚至都不需要设置cacheKey，使用公共的cacheKey前缀就足够了。

如果页面中包含有在server端查询获取的数据，那就要考虑在cacheKey中加入所有会导致查询结果发生改变的参数，包括页数，排序等。

其次，要考虑是否值得启用cache。对于用户频繁使用的页面，例如登录，菜单栏，首页，使用cache是有意义的。对于一般的只有少数人使用的维护类界面，用户访问量不大，也许页面缓存就没有必要，因为性能瓶颈在数据库交互。

如果拿不定主意，也许可以考虑这个办法：除非用户明显感觉到某个界面慢，否则就不要用页面缓存。