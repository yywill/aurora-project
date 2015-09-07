# BM的层级更新特性 #

在BM中，通过
```
<cascade-operations>
```
标签，可设置层级更新，例如：

```
<?xml version="1.0" encoding="UTF-8"?>
<bm:model xmlns:bm="http://www.aurora-framework.org/schema/bm" extend="testcase.HR.DEPT" extendMode="override">
    <bm:cascade-operations>
        <bm:cascade-operation inputPath="EMPLOYEE-LIST" model="testcase.HR.EMP" operations="insert,update,delete"/>
    </bm:cascade-operations>
</bm:model>
```

这样，在对DEPT表进行批量更新时，每条DEPT主记录更新完毕后，会找当前主记录中名为EMPLOYEE-LIST的下级记录集，并以testcase.HR.EMP为基础BM，对EMP表进行批量更新。输入参数的数据结构类似于：

```
<dept-list>
  <dept _status="insert" dname="new dept 1">
     <EMPLOYEE-LIST>
        <emp _status="insert" ename="new employee 1" />
        <emp _status="insert" ename="new employee 2" />
     </EMPLOYEE-LIST>
</dept-list>
```

如果要对多个detail表进行更新，那么在cascade-operations下面设置多条cascade-operation标记就可以了，每条对应一个detail表。

cascade-operation的属性：
|属性|说明|
|:-|:-|
|inputPath|detail记录在主记录中的访问路径|
|model|detail记录对应的BM|
|operations|detail记录允许的操作，如insert,update,delete,execute等，用逗号分隔|