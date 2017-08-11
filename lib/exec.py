from pymongo import MongoClient
import numpy as np
import importlib
import argparse
import ast
import json

parser     = argparse.ArgumentParser()
parser.add_argument('args')
args       = parser.parse_args()
arguments  = ast.literal_eval(args.args)

module     = importlib.import_module('sklearn.' + arguments[0])
estimatorName  = arguments[1].pop(0) 
estimatorFunc = eval('module.' + estimatorName)
estimator = estimatorFunc(*arguments[1])

methods = arguments[2]

results=[]
resultsZ = []
methodName = methods[0]

Z = []
    
client = MongoClient('mongodb://death:death@ds159747.mlab.com:59747/life')
    
cursor = client['life']['death'].find()
for i in cursor:
    Z.append(np.array(i.values(), dtype='U'))

if(estimatorName == 'LabelEncoder'):
    for k in range(0, len(methods[1])):
        param = np.array(methods[1][k], dtype='str')
        paramZ = Z[k]
        method = eval('estimator.' + methodName)
        data = method(param)
        dataZ = method(paramZ)
        results.append(data.tolist())
        resultsZ.append(dataZ.tolist())
           
    Y = np.array(methods[2], dtype='str')

    # estimatorFunc = eval('module.LabelBinarizer')
    # estimator = estimatorFunc(*arguments[1])
    # method = eval('estimator.fit_transform')
    # Y = method(Y)

    estimatorFunc = eval('module.OneHotEncoder')
    estimator = estimatorFunc(*arguments[1])
    method = eval('estimator.set_params')
    method(**{'sparse': False})
    method = eval('estimator.fit_transform')
    X = method(results)
    Z = method(resultsZ)
    module = importlib.import_module('sklearn.linear_model')
    estimatorName  = "LogisticRegression"
    estimatorFunc = eval('module.' + estimatorName)
    estimator = estimatorFunc(*arguments[1])

    estimator.fit(X, Y)
    res = estimator.predict(Z)

    ret = []
    for i in res:
        ret.append(i)

    print json.dumps(ret)


