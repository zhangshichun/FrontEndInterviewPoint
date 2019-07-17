# 手动实现一个promise
## 思路
- 首先它是一个类，可以通过new来初始化
- 它的构造函数，入参是一个function，该function的入参是两个callBack函数，第一个是resolve，第二个是reject。
- 它的实例具备then()方法，具备catch()方法