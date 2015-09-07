## 概述 ##

通过个性化配置，能够在运行时期动态更改配置文件的内容，实现特定需求。
配置个性化支持多种维度，维度可以扩展，维度之间的优先级可以配置。


## 个性化实现原理 ##

配置文件（screen,BM等）加载后，在实际使用之前，去数据库查询是否有对该文件的个性化设置。如果有，就加载个性化配置，根据其中的设定，动态修改配置文件。

## 基于id的个性化配置 ##

### 表结构 ###
个性化配置表：fnd\_config\_element\_customization
以文件中的某个具有id属性的tag为单位，存储个性化配置信息

|字段|含义|示例|
|:-|:-|:-|
|record\_id|PK|  |
|source\_file|源文件名|/modules/sys/sys\_user.screen|
| dimension\_type|个性化的维度|ROLE|
| dimension\_value|个性化维值|1001|
|index\_field|用于唯一确定某个标签的属性名称|id|
|index\_value|index\_field指定的属性值|sys\_user\_define\_grid|
|mod\_type|对配置文件进行更改的操作方式|insert: 插入节点 delete：删除此节点 set\_attrib: 重新设置属性值|
|position|如果是insert操作，要插入的新节点的位置|before:在此节点之前 after:在此节点之后 first\_child:第一个子节点 last\_child: 最后一个子节点|
|config\_content|如果是insert操作，要插入的配置的内容|`<a:editors><a:numberField id="cb"/></a:editors>`|
|attrib\_key|如果是set\_attrib操作，要设置的属性名|width|
|attrib\_value|如果是set\_attrib操作，要设置的属性值|900|

### 示例 ###
源文件/modules/sys/sys\_user.screen，其中包含一个id=sys\_user\_define\_grid的grid，当用户登录角色=1001时，要将宽度设置为500；当用户id=1020时，要将宽度设置为400。那么，会在表中有两条个性化配置记录：

|record\_id|source\_file|dimension\_type|dimension\_value|index\_field|index\_value|mod\_type|attrib\_key|attrib\_value|
|:---------|:-----------|:--------------|:---------------|:-----------|:-----------|:--------|:----------|:------------|
|1         |/modules/sys/sys\_user.screen|ROLE           |1001            |id          |sys\_user\_define\_grid|set\_attrib|width      |500          |
|2         |/modules/sys/sys\_user.screen|USER           |1020            |id          |sys\_user\_define\_grid|set\_attrib|width      |500          |

此screen执行之前，先通过一条这样的SQL来获取该screen所做的所有个性化配置：
```
select *
from  fnd_config_customization
where source_file=’/modules/sys/sys_user.screen‘
and dimension_type='SYSTEM'
union all
select *
from  fnd_config_customization
where source_file=’/modules/sys/sys_user.screen‘
and dimension_type='ROLE' and dimension_value=${/session/@role_id}
union all
select *
from  fnd_config_customization
where source_file=’/modules/sys/sys_user.screen‘
and dimension_type='USER' and dimension_value=${/session/@user_id}
```
这句SQL表示取出系统级、角色级、用户级三个维度的个性化配置，以系统级优先级最低，用户级最高。可以根据实际需求调整这句SQL，来定制维度的种类及优先级次序。
对这句SQL产生的结果，按dimension\_type+dimension\_value分类汇总，然后依次执行每一组里面配置的个性化内容。排后面的个性化设置会自动覆盖前面的相同设置。


## 数组元素的个性化配置 ##

数组元素是指在某个数组中具有唯一属性的元素，如grid的column。这些元素需要通过包含本数组的父节点的id来定位。

### 数据结构 ###
数组元素个性化配置数据集表：fnd\_config\_array\_item\_customization
以文件中的某个数组集合中的元素为单位，存储个性化配置信息
与fnd\_config\_customization\_detail非常类似，只是多了三个字段：array\_name用于确定是哪一个数组，array\_index\_field & array\_index\_value用于确定是数组中的哪一个元素。

|**字段**|**含义**|**示例**|
|:-----|:-----|:-----|
|record\_id|PK    |      |
|source\_file|源文件名  |/modules/sys/sys\_user.screen|
|dimension\_type|个性化的维度|ROLE  |
|dimension\_value|个性化维值 |1001  |
|index\_field|父节点用于唯一确定某个标签的属性名称|id    |
|index\_value|父节点index\_field指定的属性值|sys\_user\_define\_grid|
|array\_name|数组名称  |columns|
|array\_index\_field|用于唯一确定数组中某个元素的属性名称|name  |
|array\_index\_value|用于唯一确定数组中某个元素的属性值|employee\_code|
|mod\_type|对配置文件进行更改的操作方式|insert: 插入节点 delete：删除此节点 set\_attrib: 重新设置属性值|
|position|如果是insert操作，要插入的新节点的位置|before:在此节点之前 after:在此节点之后 first\_child:第一个子节点 last\_child: 最后一个子节点|
|config\_content|如果是insert操作，要插入的配置的内容|`<a:editors><a:numberField id="cb"/></a:editors>`|
|attrib\_key|如果是set\_attrib操作，要设置的属性名|width |
|attrib\_value|如果是set\_attrib操作，要设置的属性值|900   |

### 示例 ###
对于sys\_user.screen，当角色为1001时，要增加一个名为field1的column，并删除start\_date,end\_date字段；当用户id=1020时，要设置employee\_code的宽度=120

|record\_id|source\_file|dimension\_type|dimension\_value|index\_field|index\_value|array\_name|array\_index\_field|array\_index\_value|mod\_type|position|config\_content|attrib\_key|attrib\_value|
|:---------|:-----------|:--------------|:---------------|:-----------|:-----------|:----------|:------------------|:------------------|:--------|:-------|:--------------|:----------|:------------|
|1         |/modules/sys/sys\_user.screen|ROLE           |1001            |id          |sys\_user\_define\_grid|columns    |null               |null               |insert   |first\_child|`<a:column xmlns:a="..." name="field1" />`|null       |null         |
|2         |/modules/sys/sys\_user.screen|ROLE           |1001            |id          |sys\_user\_define\_grid|columns    |name               |start\_date        |delete   |null    |null           |null       |null         |
|3         |/modules/sys/sys\_user.screen|ROLE           |1001            |id          |sys\_user\_define\_grid|columns    |name               |end\_date          |delete   |null    |null           |null       |null         |
|4         |/modules/sys/sys\_user.screen|USER           |1001            |id          |sys\_user\_define\_grid|columns    |name               |employee\_code     |set\_attrib|null    |null           |width      |120          |

### 数组元素重排序 ###
如果需要重新设定数组元素的次序，有两种办法：A.在元素中设置顺序号属性，对该属性进行个性化配置；B.单独建一个排序表。待定。

## 个性化之后的配置文件的cache ##

如有必要，对个性化之后的配置文件进行缓存，以提高性能。cache key的设置必须包含所有可能影响个性化内容的因素，如：
`[role=1001][user=1010][file=sys_user.screen]`