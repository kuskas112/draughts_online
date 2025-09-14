<template>
	<div>
    	<p>NOT FOUND PAGE</p>
	</div>
</template>

<script>
	import { User } from '@ts/entities/User';


	export default {
		mounted() {
			console.log(this.user);
		},

		data() {
			return {
				user: new User(),
			};
		},
	};

</script>