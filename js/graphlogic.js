$(document).ready(function () {
    function textTo2DArray() {
        var foundItem = $("textarea#graph-source").val().trim().split("\n");
        for (var i = 0; i < foundItem.length; i++) {
            //foundItem[i] = foundItem[i].trim().split(/\s+/);
            foundItem[i] = foundItem[i].trim().match(/\S+/g) || [];
        }
        return (foundItem);
    }

    function findEdge(edges, from, to) {
        var foundEdge = false;
        for (var i = 0; i < edges.length; i++) {
            var currentElement = edges[i];
            if (currentElement.source.id == from && currentElement.target.id == to) {
                foundEdge = true;
                break;
            }
        }
        return foundEdge;
    }


    var drawingGraph;

    var buildGraph = function () {
        var graph = new Springy.Graph();
        var graphSource= textTo2DArray();
        isDirectional = $('#directional').is(':checked');
        if($("input[type='radio'][value='matrix']").is(":checked"))
         graph = getAdjacencyMatrix(graphSource);
        else if($("input[type='radio'][value='edgeList']").is(":checked"))
         graph = getEdgeList(graphSource);
        else if($("input[type='radio'][value='adjacencyList']").is(":checked"))
         graph = getAdjacencyList(graphSource);
        return graph;
    };

    var isEmpty = function(obj) {
        for (var k in obj) {
            if (obj.hasOwnProperty(k)) {
                return false;
            }
        }
        return true;
    };

    function getAdjacencyMatrix(matrix){
        var vertices = matrix.length;
        var numeration = 1;
        var graph = new Springy.Graph();

        for (var i = numeration; i <= vertices; i++)
            graph.addNodes(i);

        var used = new Array(vertices);
        used.fill(0);
        for (var i = 0; i < matrix.length; i++) {
            for (var j = 0; j < matrix[i].length; j++) {
                if (matrix[i][j] == 1) {
                    var array = graph.edges;

                    if (!isDirectional && !findEdge(array, i + 1, j + 1) && !findEdge(array, j + 1, i + 1)) {
                        graph.addEdges([i + 1, j + 1, {directional: false}]);
                        matrix[j][i] = 1;
                    }

                    if (isDirectional) {
                        if (!findEdge(array, i + 1, j + 1)) {
                            graph.addEdges([i + 1, j + 1, {directional: true}]);
                        }
                    }
                }
            }

        }

        for (var i = 0; i < matrix.length; i++)
            for (var j = 0; j < matrix[i].length; j++)
                if (matrix[i][j] == 1) {
                    used[i] = 1;
                    used[j] = 1;
                }
        for (var i = 0; i < used.length; i++)
            if (used[i] == 0) graph.removeNode(graph.nodes[i]);
        return graph;
    }

    function isAdjacency(graph, node1, node2){
        for(var cur in graph.adjacency[node1])
            if(cur == node2)
                return true;
        for(var cur in graph.adjacency[node2])
            if(cur == node1)
                return true;
        return false;
    }

    function getEdgeList(graph) {
        var newGraph = new Springy.Graph();
        for (var i = 0; i < graph.length; i++)
            if (graph[i].length > 2) {
                $("#errors").text("Wrong input, check out edges!");
                $("#errors").css("color", "red");
                $("#errors").css("font-weight", "bold");
                $("#errors").css("font-size", "1.2em");
                break;
            } else {
                if(!(graph[i][0] in newGraph.nodeSet) && graph[i][0] !== undefined)
                    newGraph.addNodes(graph[i][0]);
                if(!(graph[i][1] in newGraph.nodeSet) && graph[i][1] !== undefined)
                    newGraph.addNodes(graph[i][1]);
                if(isAdjacency(newGraph, graph[i][0], graph[i][1]) && !isDirectional)
                    continue;
                else {
                    if(graph[i][0] !== undefined && graph[i][1] !== undefined)
                        newGraph.addEdges([graph[i][0], graph[i][1], {directional: isDirectional}]);
                }
            }
        return newGraph;
    }


    function getAdjacencyList(graph) {
        var newGraph = new Springy.Graph();
        console.log("GRAPH.LENGTH " + graph.length);
        for (var i = 1; i <= graph.length; i++) {
            if (graph[i - 1][0] > graph[i - 1].length - 1 || graph[i - 1][0] < graph[i - 1].length - 1) {
                $("#errors").text("Wrong input, check out number of edges!");
                $("#errors").css("color", "red");
                return undefined;
            } else {
                if(!(i in newGraph.nodeSet))
                    newGraph.addNodes(i);

                for (var j = 1; j < graph[i - 1].length; j++) {
                    if(!(graph[i - 1][j] in newGraph.nodeSet))
                        newGraph.addNodes(graph[i - 1][j]);
                    if(isAdjacency(newGraph, i, graph[i - 1][j]) && !isDirectional)
                        continue;
                    else {
                        if (graph[i - 1][j] !== undefined && i !== undefined)
                            newGraph.addEdges([i, graph[i - 1][j], {directional: isDirectional}]);
                    }
                }
            }

        }
        return newGraph;
    }

    graphToEdgeList = function (graph) {
        var edgeList = [];
        for (var edgeIndex = 0; edgeIndex < graph.edges.length; edgeIndex++) {
            var edge = graph.edges[edgeIndex];
            edgeList.push(edge.source.id + " " + edge.target.id);
        }
        return edgeList;
    };


    graphToAdjacencyList = function (graph) {
        var adjanceyList = new Array(graph.nodes.length);


        for (var edgeIndex = 0; edgeIndex < graph.edges.length; edgeIndex++) {
            var edge = graph.edges[edgeIndex];
            if (adjanceyList[edge.source.id] == undefined)
                adjanceyList[edge.source.id] = new Array();
            adjanceyList[edge.source.id].push(edge.target.id);
        }
        var finalAdjanceyList = new Array();
        for (var i = 0; i < adjanceyList.length; i++) {
            var answerString = '';
            if (adjanceyList[i] != undefined) {
                answerString += adjanceyList[i].length + ' ';
                answerString += adjanceyList[i].join(' ');
            } else {
                answerString += '0';
            }
            finalAdjanceyList.push(answerString);
        }
        return finalAdjanceyList.join('\n');
    };

    $("#refresh").click(function () {
        var buildedGraph = buildGraph();
        if (buildedGraph !== undefined) {
            drawingGraph = $("#springydemo").springy({graph: buildedGraph});
        }
    });

    var today = new Date();
    var year = today.getFullYear();
    document.getElementById("year").innerHTML = year;


});