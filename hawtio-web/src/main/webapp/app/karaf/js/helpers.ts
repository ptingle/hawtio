module Karaf {

    export function setSelect(selection, group) {
        if (!angular.isDefined(selection)) {
            return group[0];
        }
        var answer = group.findIndex(function (item) {
            return item.id === selection.id
        });
        if (answer !== -1) {
            return group[answer];
        } else {
            return group[0];
        }
    }

    export function installFeature(workspace, jolokia, feature, version, success, error) {
        jolokia.request(
            {
                type: 'exec', mbean: getSelectionFeaturesMBean(workspace),
                operation: 'installFeature(java.lang.String, java.lang.String)',
                arguments: [feature, version]
            },
            onSuccess(success, { error: error }));
    }

    export function uninstallFeature(workspace, jolokia, feature, version, success, error) {
        jolokia.request(
            {
                type: 'exec', mbean: getSelectionFeaturesMBean(workspace),
                operation: 'uninstallFeature(java.lang.String, java.lang.String)',
                arguments: [feature, version]
            },
            onSuccess(success, { error: error }));
    }

    // TODO move to core?
    export function toCollection(values) {
        var collection = values;
        if (!angular.isArray(values)) {
            collection = [values];
        }
        return collection;
    }

    export function featureLinks(workspace, name, version) {
            return  "<a href='" + url("#/karaf/feature/" + name + "/" + version + workspace.hash()) + "'>" + version + "</a>";
    }

    export function extractFeature(attributes, name, version) {
        var f = {};
        angular.forEach(attributes["Features"], (feature) => {
            angular.forEach(feature, (entry) => {
                if (entry["Name"] === name && entry["Version"] === version) {
                    var deps = [];
                    populateDependencies(attributes, entry["Dependencies"], deps);
                    f["Name"] = entry["Name"];
                    f["Version"] = entry["Version"];
                    f["Bundles"] = entry["Bundles"];
                    f["Dependencies"] = deps;
                    f["Installed"] = entry["Installed"];
                    f["Configurations"] = entry["Configurations"];
                    f["Configuration Files"] = entry["Configuration Files"];
                    f["Files"] = entry["Configuration Files"];
                }
            });
        });
        return f;
    }

    export function populateFeaturesAndRepos(attributes, features, repositories) {
        angular.forEach(attributes["Repositories"], (repo) => {

            repositories.push({
                id: repo["Name"],
                uri: repo["Uri"]
            });

            angular.forEach(repo["Features"], (feature) => {
                angular.forEach(feature, (entry) => {
                    var f = {};
                    f["Id"] = entry["Name"] +"/" + entry["Version"];
                    f["Name"] = entry["Name"];
                    f["Version"] = entry["Version"];
                    f["Installed"] = entry["Installed"];
                    f["Repository"] = repo["Name"];
                    features.push(f);
                });
            });
        });
    }

    export function populateDependencies(attributes, dependencies,  features) {
        angular.forEach(dependencies, (feature) => {
            angular.forEach(feature, (entry) => {
                var enhancedFeature = extractFeature(attributes, entry["Name"], entry["Version"]);
                enhancedFeature["id"] = entry["Name"] +"/" + entry["Version"];
                //enhancedFeature["repository"] = repo["Name"];
                features.push(enhancedFeature);
            });
        });
    }

    export function getSelectionFeaturesMBean(workspace:Workspace):string {
        if (workspace) {
            // lets navigate to the tree item based on paths
            var folder = workspace.tree.navigate("org.apache.karaf", "features");
            if (folder) {
                var children = folder.children;
                if (children) {
                    var node = children[0];
                    if (node) {
                        return node.objectName;
                    }
                }
            }
        }
        return null;
    }
}