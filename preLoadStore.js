'use strict';
var matchRoutes = require("./matchRoutes").default;
var sequence = require("./sequence").default;

function preLoadStore(location, store, routes) {
    try {
        const matchedRoutes = matchRoutes(routes, location.uri);
        // console.log("matchedRoutes===", JSON.stringify(matchedRoutes));
        if (matchedRoutes.length == 0) {
            return Promise.resolve(true);
        }
        // console.log("matchedRoutes", JSON.stringify(matchedRoutes));
        const paramsWithActions = matchedRoutes.reduce((paramsList, {route, match})=>
            (route.loadData && route.loadData.length > 0 ) ?
                paramsList.concat({actions: route.loadData, params: match.params})
                : paramsList, []);
        // console.log("Before NEED==============",paramsWithActions);

        const actionList = paramsWithActions.reduce((actionList, {actions, params})=>(actions.length > 0 ) ?
            actionList.concat(actions.map((action)=>({action, params})))
            : actionList, []);
        // needs = flatten(needs);
        // console.log("After NEED==============", actionList);

        const promisesObj = actionList.reduce((promisesObj, actionObj)=> {
            typeof actionObj.action == "object" ? promisesObj.sequential.push(actionObj) : promisesObj.parallel.push(actionObj)
            return promisesObj;
        }, {sequential: [], parallel: []})
        const actionPara = {
            queryString: location.queryString,
            params: {},
            store: {},
        };
        const sortedSequentialPromises = promisesObj.sequential.sort((a, b)=>a.action.priority - b.action.priority);
        // console.log("sortedSequentialPromises############",JSON.stringify(sortedSequentialPromises));


        const parallelPromisesArray = promisesObj.parallel.map((actionObj)=>store.dispatch(actionObj.action({
            queryString: location.queryString,
            store: store.getState(),
            params: actionObj.params
        })));
        const sequentialPromises = sequence(sortedSequentialPromises, actionObj => store.dispatch(actionObj.action.actionName({
            queryString: location.queryString,
            store: store.getState(),
            params: actionObj.params
        })));
        return Promise.all(parallelPromisesArray.concat(sequentialPromises));
        // return sequence(actionList,actionObj => store.dispatch(actionObj.action({...actionPara,store:store.getState(),params:actionObj.params})));
    } catch (err) {
        console.log("something went wrong in pre Load Store ",err)
        return Promise.resolve(true);
    }
}


exports.default = preLoadStore;
