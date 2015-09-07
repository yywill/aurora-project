# 常规情况 #

BM在执行update操作时，如果设置了只更新客户端提交的字段（几乎是所有的场合都需要这样），那么，参数中没有提交的字段就不会被拼接到update语句中。

例如，BM有t1~t5 5个字段，如果客户端提交的参数是：
```
{ parameter:{ pk:1000,t1:'test1', t3:'test5'} }
```
那么，自动生成的update语句就是
```
update ... set t1='test1', t3='test5' where pk=1000
```

# 必须更新的字段 #

诸如last\_update\_date这样的standard who字段应该是不依赖于客户端提交的参数的，每次update都需要同时执行这样的操作。这时候就需要在BM中设置该字段的forceUpdate属性为true。例如：
```
<field name="last_update_date" forceUpdate="true" updateExpression="sysdate" />
```
设置该属性时，如果该字段的update语句依赖于客户端输入的参数，请务必考虑客户端可能会提交空值的情况。

# 自定义update语句 #

有时候，某字段的update语句是一段SQL表达式，这段表达式所依赖的输入参数的名称不一定和字段相同。例如：
```
<field name="total_amount" updateExpression="my_pkg.get_sum(${/parameter/@order_head_id})" />
```
按照前面的逻辑，如果没有传递一个名叫total\_amount的参数，这个字段就不会被更新。这时，就需要设置一下inputPath属性，设置成该字段依赖的一个输入参数，如 inputPath="/parameter/@order\_head\_id"
这样，只要传递了order\_head\_id参数，这个字段就会按updateExpression指定的表达式去执行update。<field name="total_amount" updateExpression="my_pkg.get_sum(${/parameter/@order_head_id})" />
}}}```