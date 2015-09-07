## 基础接口 ##

uncertain.cache包中定义了几个对cache操作的基础行为进行抽象的接口。

uncertain.cache.ICache定义了一个可提供cache功能的对象所应具有的基本操作。例如，通过setValue()向cache中写入数据，通过getValue()从cache中获取数据。

uncertain.cache.ICacheFactory定义了获取cache实例的工厂类所具有的统一接口，通过getCache()方法获得一个可用的ICache实例。

uncertain.cache.INamedCacheFactory进一步定义了可以通过命名来获得cache实例的方法。

Aurora cache机制基于这样一种约定：通过命名来获取特定的cache。例如，将所有的screen源文件解析得到的CompositeMap缓存到名为WebResource的cache中，需要访问时，通过一个INamedCacheFactory实例获得该命名的cache：

```

// 获取cache工厂类的实例
INamedCacheFactory fact = ...

// 获取名为WebResource的cache 
ICache cache = fact.getNamedCache("WebResource");


// 从cache中获取文件名为a.screen的源文件对应的CompositeMap
CompositeMap map = (CompositeMap)cache.getValue(“a.screen”);

// 如果不存在，装载这个文件，创建CompositeMap，并写入到cache中
if(map==null){
   CompositeLoader loader = .... // 获取一个CompositeLoader实例
   map = loader.load("a.screen");
   cache.setValue("a.screen",map);
}

```

## Cache Factory配置文件 ##


在WEB-INF下创建0.cache.config文件，内容为

```
<cache-factory-config xmlns="uncertain.cache" defaultCacheFactory="InMemory" >
	<cache-factories>
		<map-based-cache-factory name="InMemory" />
		<memcached-client-factory xmlns="aurora.plugin.memcached" name="Memcached" serverList="localhost:9999"/>
	</cache-factories>
	<cache-mappings>
		<cache-mapping name="BusinessModel" cacheFactory="InMemory" enabled="true"/>
		<cache-mapping name="WebResource" cacheFactory="InMemory" enabled="true" />
		<cache-mapping name="ResponseCache" cacheFactory="Memcached" enabled="true" />
		<cache-mapping name="ViewComponentTemplates" cacheFactory="InMemory" enabled="true" />
	</cache-mappings>
</cache-factory-config>
```

说明：
`<cache-factories>`
此部分配置系统可用的cache的提供者，并给以命名，供后面需要使用cache的地方选用。其下包含1..n个可以映射为uncertain.cache.INamedCacheFactory的XML tag。目前Aurora提供两种Cache factory，`<map-based-cache-factory>`是基于HashMap的简单实现，用于可以在内存中缓存的数据。`<memcached-client-factory>`使用memcached作为后端cache实现，内部使用spymemcached作为memcached的java客户端。通过serverList属性配置memcached server的ip和端口号，如果有多个memcached server，用空格分开每个server，例如：serverList="10.213.1.21:9000 10.213.1.22:9000 10.213.1.23:9888"。使用memcached支持，必须在web server中包含spymemcached客户端jar，以及aurora-plugin.jar。

在上述配置例子中，分别给这两个cache factory用name属性进行命名，以便区分。

`<cache-mappings>`
此部分配置预先约定的cache名称与INamedCacheFactory实例的对应关系，由此，可以设置某种类型的cache由哪个INamedCacheFactory实例来提供，以及这部分cache是否启用。例如：
```
<cache-mapping name="WebResource" cacheFactory="InMemory" enabled="true" />
```
设置WebResource由前面所配置的，名为InMemory的INamedCacheFactory实例来提供。也就是说，所有screen及svc文件的缓存，是由基于HashMap的简单cache来实现的。

顶层元素`<cache-factory-config>`中，可以设置defaultCacheFactory属性，以指定缺省的实例。所有没有在该配置文件中显式指定提供者的cache，都由这个缺省实例来提供。

## 内建Cache命名 ##

Aurora框架中内建的cache种类及命名约定如下：

|名称|用途|
|:-|:-|
|BusinessMode|以解析后的aurora.bm.BusinessModel对象来缓存的.bm文件|
|WebResource|解析为CompositeMap的screen/svc文件的缓存|
|ResponseCache|页面输出的缓存|
|ViewComponentTemplates|Aurora UI组件所使用的.tplt模板文件的缓存|