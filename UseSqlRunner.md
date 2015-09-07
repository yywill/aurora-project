
```
import aurora.database.ParsedSql;
import aurora.database.ResultSetLoader;
import aurora.database.SqlRunner;

// 获取service的context
CompositeMap context ＝ ...

// 转换为SqlServiceContext
SqlServiceContext sql_context ＝ SqlServiceContext.createSqlServiceContext();

// 如果不是在session级的service中，context是自己创建的，那么使用之前
// 需要调用SqlServiceContext.setConnection()，或通过
// SqlServiceContext.createSqlServiceContext(Connection)方法创建SqlServiceContext对象

String sql = new String("select ... from ... where user_id=${/session/@user_id}");
ParsedSql stmt = createStatement(sql);
SQLRunner runner = new SqlRunner(sql_context, stmt);

// 之前先把必要的参数放入context
ResultSet rs = runner.query(sql_context.getCurrentParameter());

// 如需将结果集变为CompositeMap:
ResultSetLoader     mRsLoader = new ResultSetLoader();
FetchDescriptor desc ＝ FetchDescriptor.fetchAll(); // 如果不是加载全部结果集，则创建一个FetchDescriptor对象并设置其分页属性
CompositeMap result = new CompositeMap("result");
CompositeMapCreator compositeCreator = new CompositeMapCreator(result);
mRsLoader.loadByResultSet( rs, desc, consumer );
```