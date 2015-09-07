# 简介 #

有很多主数据表的数据量非常大，且经常需要被其他表做关联查询，这样情况下就有查询效率慢，消耗数据库资源多的问题。通过把这些主数据表的数据做缓存，在需要关联查询时，先单查询非主数据的内容，然后再对查询结果集进行逐条添加主数据的内容，能够极大提高查询效率。


# 配置 #

  * 在${WEB-HOME}/web-inf/aurora.feature目录下添加bm-cached-join.config文件，内容是
```
  <bm:BmCachedJoin xmlns:bm="aurora.bm" />
```
  * 在${WEB-HOME}/web-inf/cacheConfig目录下添加主数据表的配置文件。例如需要对sys\_user表做缓存，对应的bm是sys.sys\_user。那么添加一个sys\_user.config（文件名可以任意，后缀必须是config），文件内容是
```
<?xml version="1.0" ?>
<period-mode-cache-provider xmlns="aurora.application.features.cache" baseBM="sys.sys_user"/> 
```
> 还有其他属性列示如下：

| 属性| 描述    | 默认值 |
|:--|:------|:----|
| key  | 缓存键值  | 默认用bm中指定的表主键 |
|refreshInterval|自动刷新间隔,毫秒|36000，即一小时|
|cacheName|缓存名称   |bm名字 |
|cacheDesc|缓存描述   |bm名字 |


  * 在sys.sys\_user这个bm的顶级节点上加useCacheJoin="true"

# 效果 #
  * bm文件内容
```
<ns1:model xmlns:ns1="http://www.aurora-framework.org/schema/bm" alias="t1" 
extend="sys.sys_task_excels" extendMode="reference">
    <ns1:fields>
        <ns1:field name="excel_id"/>
        <ns1:field name="task_id"/>
        <ns1:field name="session_id"/>
        <ns1:field name="user_id"/>
        <ns1:field name="role_id"/>
        <ns1:field name="company_id"/>
        <ns1:field name="lang"/>
        <ns1:field name="file_path"/>
        <ns1:field name="url"/>
        <ns1:field name="creation_date_view" 
expression="to_char(t1.creation_date, &apos;yyyy-mm-dd hh24:mi:ss&apos;)"/>
    </ns1:fields>
    <ns1:ref-fields>
        <ns1:ref-field name="company_short_name" relationName="r_cpy" sourceField="company_short_name"/>
        <ns1:ref-field name="user_description" relationName="r_user" sourceField="description"/>
        <ns1:ref-field name="role_name_id" relationName="r_role" sourceField="role_name_id"/>
        <ns1:ref-field name="task_description" relationName="r_task" sourceField="task_description"/>
        <ns1:ref-field name="lang_description" relationName="r_lang" sourceField="description"/>
    </ns1:ref-fields>
    <ns1:relations>
        <ns1:relation name="r_cpy" joinType="LEFT OUTER" refAlias="cpy" refModel="fnd.fnd_companies_vl">
            <ns1:reference foreignField="company_id" localField="company_id"/>
        </ns1:relation>
        <ns1:relation name="r_user" joinType="LEFT OUTER" refAlias="u" refModel="sys.sys_user">
            <ns1:reference foreignField="user_id" localField="user_id"/>
        </ns1:relation>
        <ns1:relation name="r_role" joinType="LEFT OUTER" refAlias="ro" refModel="sys.sys_role">
            <ns1:reference foreignField="role_id" localField="role_id"/>
        </ns1:relation>
        <ns1:relation name="r_task" joinType="LEFT OUTER" refAlias="task" refModel="sys.sys_tasks">
            <ns1:reference foreignField="task_id" localField="task_id"/>
        </ns1:relation>
        <ns1:relation name="r_lang" joinType="LEFT OUTER" refAlias="lang" refModel="sys.sys_languages">
            <ns1:reference foreignField="language_code" localField="lang"/>
        </ns1:relation>
    </ns1:relations>
    <ns1:query-fields>
        <ns1:query-field name="creation_date_from" 
queryExpression="t1.creation_date &gt; to_date(${@creation_date_from},&apos;YYYY-MM-DD&apos;)"/>
        <ns1:query-field name="creation_date_to" 
queryExpression="t1.creation_date &lt; to_date(${@creation_date_to},&apos;YYYY-MM-DD&apos;)"/>
    </ns1:query-fields>
</ns1:model>
```

  * 未启用主数据缓存，这个bm生成的查询sql语句是：
```
SELECT t1.EXCEL_ID,t1.TASK_ID,t1.SESSION_ID,t1.USER_ID,t1.ROLE_ID,t1.COMPANY_ID,t1.LANG,
t1.FILE_PATH,t1.URL,to_char(t1.creation_date, 'yyyy-mm-dd hh24:mi:ss') AS
 creation_date_view,(select DESCRIPTION_TEXT from fnd_descriptions where 
DESCRIPTION_ID=ro.role_name_id and Language=?) AS 
role_name,cpy.COMPANY_SHORT_NAME,u.description AS 
user_description,ro.role_name_id,task.TASK_DESCRIPTION,lang.DESCRIPTION AS 
lang_description
FROM SYS_TASK_EXCELS t1
	LEFT OUTER JOIN FND_COMPANIES_VL cpy ON t1.COMPANY_ID = cpy.COMPANY_ID
	LEFT OUTER JOIN sys_user u ON t1.USER_ID = u.user_id
	LEFT OUTER JOIN sys_role ro ON t1.ROLE_ID = ro.role_id
	LEFT OUTER JOIN SYS_TASKS task ON t1.TASK_ID = task.TASK_ID
	LEFT OUTER JOIN SYS_LANGUAGES lang ON t1.LANG = lang.LANGUAGE_CODE
WHERE t1.user_id=? and t1.role_id = ?
```
  * 启用sys.sys\_user主数据缓存后，这个bm生成的查询语句是：
```
SELECT t1.EXCEL_ID,t1.TASK_ID,t1.SESSION_ID,t1.USER_ID,t1.ROLE_ID,t1.COMPANY_ID,t1.LANG,
t1.FILE_PATH,t1.URL,to_char(t1.creation_date, 'yyyy-mm-dd hh24:mi:ss') AS 
creation_date_view,(select DESCRIPTION_TEXT from fnd_descriptions where 
DESCRIPTION_ID=ro.role_name_id and Language=?) AS 
role_name,cpy.COMPANY_SHORT_NAME,ro.role_name_id,task.TASK_DESCRIPTION,
lang.DESCRIPTION AS lang_description
FROM SYS_TASK_EXCELS t1
	LEFT OUTER JOIN FND_COMPANIES_VL cpy ON t1.COMPANY_ID = cpy.COMPANY_ID
	LEFT OUTER JOIN sys_role ro ON t1.ROLE_ID = ro.role_id
	LEFT OUTER JOIN SYS_TASKS task ON t1.TASK_ID = task.TASK_ID
	LEFT OUTER JOIN SYS_LANGUAGES lang ON t1.LANG = lang.LANGUAGE_CODE
WHERE t1.user_id=? and t1.role_id = ?
```
> 对比上下两句，可以观察到后面这个sql减少了与sys\_user 的关联。后面这个sql执行获得结果后，系统再对结果集进行遍历，从缓存从添加sys\_user 的数据。

# 注意事项 #

## 局限 ##
只支持inner join和left join，这两种方式以外的join不会利用缓存，还有如果关联关系中用表达式也不会利用缓存，仍旧采取sql的查询方式。
## 调整 ##
对于关联的多语言字段，比如启用了sys.sys\_role的缓存，那么在关联中查找role\_name，不用再写role\_name\_id，而是直接使用role\_name即可。
## 错误 ##
对于关联sys.sys\_user\_role\_groups在关联查询中加入关联表的查询会有问题
## 副作用 ##
降低启动速度。大致：数据在万级时会延迟几分钟，即十万级会延迟几十分钟。