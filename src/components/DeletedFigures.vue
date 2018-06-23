<template>
    <div class="figure-container col-2" v-bind:class="{ [color]: true }">
        <div class="figure" v-for="figure in color == 'whites' ? deletedWhites : deletedBlacks" v-bind:key="figure['.key']" v-bind:class="getFigureCss(figure['.value'])"></div>
    </div>        
</template>

<script>
import { deletedWhitesRef } from '../firebase';
import { deletedBlacksRef } from '../firebase';
import mixin from '../mixins';

export default {
    props: ['color'],
    mixins: [mixin],
    firebase: {
        deletedWhites: deletedWhitesRef,
        deletedBlacks: deletedBlacksRef 
    }
}
</script>

<style lang="scss" scoped>
@import '../../node_modules/bootstrap/scss/bootstrap.scss';

.figure-container {
    $figureSize: 20px;
    
    display: flex;
    flex-wrap: wrap;

    &.whites {
        align-content: flex-start;
        align-items: flex-start
    }

    &.blacks {
        align-content: flex-end;
        align-items: flex-end;
    }

    .figure {
        background-size: cover;
        height: $figureSize;
        width: $figureSize;
    }

    @include media-breakpoint-up(md) {
        $figureSize: 40px;
        .figure {
            height: $figureSize;
            width: $figureSize;
        }
    }

    @include media-breakpoint-up(lg) {
        $figureSize: 50px;
        .figure {
            height: $figureSize;
            width: $figureSize;
        }
    }
}
</style>