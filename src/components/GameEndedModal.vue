<template>
    <b-modal ref="gameEndedRef" hide-footer no-close-on-backdrop>
        <h2 class="text-center">{{ message }}</h2>
        <p class="text-center">
            <b-btn v-on:click="newGame">New Game</b-btn>
        </p>
    </b-modal> 
</template>

<script>
export default {
    props: ['message'],
    methods: {
        newGame() {
            this.$root.$emit('newGame');
        }
    },
    created() {
        setTimeout(() => { this.$refs.gameEndedRef.show(); });
    }
}
</script>