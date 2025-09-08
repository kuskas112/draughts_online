<template>
  <div>
    <h1>Hello from Vue!</h1>
    <ExampleComponent />
    <NotFound />
  </div>
</template>

<script>
import ExampleComponent from './components/ExampleComponent.vue';
import NotFound from './components/NotFound.vue';

export default {
  components: {
    ExampleComponent,
    NotFound
  },
};
</script>