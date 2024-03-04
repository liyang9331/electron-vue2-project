<template>
    <div :class="['m-button', { 'center': center }]">
        <router-link v-if="isRoute" :to="route" :target="target" :disabled="disabled" class="u-button fade"
            :class="[type, size, { [effect]: type === 'default', widthType: width, disabled: disabled }]"
            :style="{ borderRadius: borderRadius + 'px', width: (width - 2) + 'px', height: (height - 2) + 'px', lineHeight: (height - 2) + 'px' }">
            <slot>{{ name }}</slot>
        </router-link>

        <a v-if="!isRoute" @click="$emit('click')" :disabled="disabled" class="u-button"
            :class="[type, size, { [effect]: type === 'default', widthType: width, disabled: disabled }]"
            :style="{ borderRadius: borderRadius + 'px', width: (width - 2) + 'px', height: (height - 2) + 'px', lineHeight: (height - 2) + 'px' }">
            <img v-if="icon != ''" :src="icon" :width="iconSize + 'px'" alt="" srcset="">
            <slot>{{ name }}</slot>
        </a>
    </div>
</template>
<script>
export default {
    name: 'Button',
    props: {
        name: { // 按钮默认文本
            type: String,
            default: '按钮'
        },
        type: { // 按钮类型
            type: String,
            default: 'default' // 'default' 'primary' 'danger'
        },
        effect: { // 按钮悬浮变化效果，只有type为default时，reverse才生效
            type: String,
            default: 'fade' //  'fade' 'reverse'
        },
        size: { // 按钮尺寸
            type: String,
            default: 'middle' // 'small' 'middle' 'large'
        },
        width: { // 按钮宽度
            type: Number,
            default: 0
        },
        height: { // 按钮高度
            type: Number,
            default: 40
        },
        borderRadius: { // 按钮圆角
            type: Number,
            default: 4
        },
        route: { // 按钮跳转目标URL地址
            type: Object,
            default: () => {
                return {}
            }
        },
        target: { // 按钮如何打开目标URL，设置route时才起作用
            type: String,
            default: '_self'
        },
        disabled: { // 按钮是否禁用
            type: Boolean,
            default: false
        },
        center: { // 是否将按钮设置为块级元素并居中展示
            type: Boolean,
            default: false
        },
        icon: { //图标 名称/图片链接
            type: String,
            default: ''
        },
        iconSize: { //图标大小
            type: Number,
            default: ''
        }
    },
    data () {
        return {
        }
    },
    computed: {
        isRoute () {
            if (JSON.stringify(this.route) === '{}') {
                return false
            } else {
                return true
            }
        }
    },
    created () {
    },
    methods: {
    }
}
</script>
<style lang="scss" scoped>
$primary: #1890ff;
$danger: #ff4d4f;

.m-button {
    display: inline-block;

    .u-button {
        //   display: inline-block;
        display: flex;
        align-items: center;
        justify-content: center;
        color: rgba(0, 0, 0, .65);
        background-color: #fff;
        border: 1px solid #d9d9d9;
        box-shadow: 0 2px 0 rgb(0 0 0 / 2%);
        transition: all .3s cubic-bezier(.645, .045, .355, 1);
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        cursor: pointer;
        & img{
            margin-right: 5px;
        }
    }

    .primary {
        color: #fff;
        background-color: $primary;
        border-color: $primary;
        text-shadow: 0 -1px 0 rgb(0 0 0 / 12%);
        box-shadow: 0 2px 0 rgb(0 0 0 / 5%);

        &:hover {
            background-color: #40a9ff;
            border-color: #40a9ff;
        }

        &:active {
            background-color: #096dd9;
            border-color: #096dd9;
        }
    }

    .default {
        //   .fade();
    }

    .danger {
        color: #fff;
        background-color: $danger;
        border-color: $danger;
        text-shadow: 0 -1px 0 rgb(0 0 0 / 12%);
        box-shadow: 0 2px 0 rgb(0 0 0 / 5%);

        &:hover {
            background-color: #ff7875;
            border-color: #ff7875;
        }

        &:active {
            background-color: #d9363e;
            border-color: #d9363e;
        }
    }

    .fade {
        &:hover {
            color: #40a9ff;
            border-color: #40a9ff;
        }

        &:active {
            color: #096dd9;
            border-color: #096dd9;
        }
    }

    .reverse {
        &:hover {
            color: #fff;
            background-color: #40a9ff;
            border-color: #40a9ff;
        }

        &:active {
            color: #fff;
            background-color: #096dd9;
            border-color: #096dd9;
        }
    }

    .small {
        height: 24px;
        line-height: 24px;
        padding: 0 7px;
        font-size: 14px;
    }

    .middle {
        height: 32px;
        line-height: 32px;
        padding: 0 15px;
        font-size: 14px;
    }

    .large {
        height: 40px;
        line-height: 40px;
        padding: 0 15px;
        font-size: 16px;
    }

    .widthType {
        padding: 0;
        text-align: center;
    }

    .disabled {
        color: rgba(0, 0, 0, 0.25);
        background-color: #f5f5f5;
        border-color: #d9d9d9;
        text-shadow: none;
        box-shadow: none;
    }
}

.center {
    display: block;
    text-align: center;
}</style>
