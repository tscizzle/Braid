angular.module('strandService', [])

    .factory('Strands', ['$http', function($http) {
        return {
            get: function(convo_id) {
                return $http.get('/api/strands/' + convo_id);
            },
            create: function(strandData) {
                return $http.post('/api/strands', strandData);
            }
        };
    }]);
