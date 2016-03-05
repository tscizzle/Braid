angular.module('strandService', [])
    .factory('Strands', function($http) {
        return {
            get: function(convo_id) {
                return $http.get('/api/strands/' + convo_id);
            },
            create: function(strandData) {
                return $http.post('/api/strands', strandData);
            }
        };
    });
