angular.module('strandService', [])

    .factory('Strands', ['$http', function($http) {

        return {
            get: function(convo_id) {
                return $http.get('/api/strands/' + convo_id);
            },
            create: function(strandData) {
                return $http.post('/api/strands', strandData);
            },
            // paintStrand: function(strand_id, time_created) {
            //     return $http.post('/api/paintStrand', {strand_id: strand_id , time_created: time_created, color: color});
            // }
        };
<<<<<<< HEAD
    }]);
=======

    }]);
>>>>>>> da7790a40ceb442ab6e72ca0f9dfbef25835dfea
