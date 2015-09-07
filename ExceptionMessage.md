1.通过静态工厂方法装载预定义的property文件，实现异常信息的code与实际内容的映射。例如：

```
class MyClass {

static {
  
MessageFactory.loadResource("aurora/database/database_exceptions.property")
;
}

}
```

在文件 aurora/database/database\_exceptions.property.Zh\_cn 中定义：

```
...
aurora.database_datatype_error=字段所设置的数据库类型{1}错误，该字段只能设置为{2}类型，请检查配置文件
...
```

MessageFactory内部通过一个static的Map维护所有装载过的code/message映射。


2.在需要抛异常的地方，通过静态工厂方法创建一个具有上述预定义code的异常：

```
try{
	....
}catch(SQLException sql_ex){
	GeneralException ex =
MessageFactory.createException("aurora.database_datatype_error", sql_ex,
new Object[]{ field_type, expected_type } );
	throw ex;
}
```

GeneralException是一个预定义的通用Exception，由RuntimeException派生而来，用于表示不需要显示捕获的异常，例如配
置错误。


3. 对于其它自己定义的异常，通过MessageFactory的静态方法来获得message，再构造自定义异常：

```
try{
	....
}catch(SQLException sql_ex){
	String msg = MessageFactory.getMessage("aurora.database_datatype_error",
new Object[]{ field_type, expected_type } );
	MyException ex = new MyException(msg, sql_ex);
	throw ex;
}
```