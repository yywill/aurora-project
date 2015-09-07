## HTML模板 ##

首先由美工设计好html文件，将文件存在aurora.config中presentation-manager部分所配置的某个自定义界面组件包（例如，WEB-INF/ui.template）的theme/default/template目录下，扩展名改为.tplt。在这个html文件中，将需要动态从model中获取内容的部分，用$标记代替。例如：

```

	<span>员工编辑</span>
	<pre>基本信息</pre>
		<form>
			Name: ${name}<br>
			Address: ${address}<br>
			Department: ${deptid}<br>
			Memo: ${memo}<br>
		</form>
```
假设保存的文件名是emp\_form.tplt。

## 使用template组件 ##

首先，通过数据库查询，将要显示的记录取出来，放在某个路径中。例如：`/model/emp/record`
然后，使用template组件，指定前面完成的html模板，并将所有动态部分的内容放在template下面。
```
<a:template package="ui.template" template="emp_form">
   <span id="name">${/model/emp/@name}</span>
   <span id="address">${/model/emp/@address}</span>
   <span id="memo">${/model/emp/@memo}</span>
</a>
```

template组件会解析emp\_form.tplt文件，遇到`${name}`标记，会查找其下id为name的组件，也就是
```
<span id="name">${/model/emp/@name}</span>
```
将它渲染的结果替换`${name}`。以此类推，所有标记都会被替换成对应id的组件。

template组件下面包含的子组件，必须有一个独一无二的名字属性，以区别与其它组件。属性名缺省为id，可以通过`<template indexField="name">`来设置为其它的属性名。