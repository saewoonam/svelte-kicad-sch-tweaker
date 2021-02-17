var ghpages = require('gh-pages');

ghpages.publish(
    'public',// <-- replace yourproject with your repo name
    {
        branch: 'gh-pages',
        repo: 'git@github.com:saewoonam/svelte-kicad-sch-tweaker.git'
      /*
        user: {
            name: 'SaeWoo Nama',
            email: 'nams@nist.gov'
        }
        */
    },
    () => {
        console.log('Deploy Complete!')
    }
)

