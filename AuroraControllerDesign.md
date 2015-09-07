# Aurora Controller 设计概要 #

## Screen ##

用途：输出HTML内容

扩展名：.screen

样例：
```
<?xml version="1.0" encoding="UTF-8"?>
<screen xmlns="http://www.aurora-framework.org/schema/application">

<parameters>
	<parameter name="employee_id" dataType="number" />
</parameters>

<init-procedure>
	<sql-query name="hr.get_employee_list" />
	<sql-execute name="hr.update_access_acount" />
</init-procedure>

<page>
	<datasets>
		<dataset name="EMPLOYEE_QUERY" >
			<fields>
				<field name="EMPLOYEE_NAME" dataType="string" />
				<field name="EMPLOYEE_CODE" dataType="string" />
			</fields>
		</dataset>
		<dataset ref="HR.EMPLOYEE" />	
	</datasets>
	<form>
		<text name="EMPLOYEE_NAME" bindingDataset="EMPLOYEE_QUERY" />
	</form>
</page>

</screen>
```

处理流程：
```
<procedure>
	<action Name="ParseParameter" />
	<action Name="CreateModel" />
	<action Name="CreateView" />
</procedure>
```

## Service ##

用途：执行数据存取操作，并将结果以JSON/XML等格式输出

扩展名：.svc

样例：
```
<service>
<parameters>
	<parameter name="employee_id" dataType="number" />
</parameters>
<procedure>
	<sql-query name="hr.get_employee_list" />
	<sql-execute name="hr.update_access_acount" /> 
</procedure>
</service>
```

处理流程：

```
<?xml version="1.0" encoding="UTF-8"?>
<procedure xmlns="uncertain.proc">
	<action name="ParseParameter" />
	<action name="ValidateInput" />
	<action name="InvokeService"/>
	<action name="CreateSuccessResponse"/>
	<exception-handles>
		<catch Exception="*">
			<action name="CreateFailResponse">
		</catch>
	</exception-handles>
</procedure>
```