<script>
	import { slide, fly, fade } from 'svelte/transition';
	import moment from 'moment';
	import { cubicOut } from 'svelte/easing';

	export let expanded = true;
	export let author;
	export let created_utc;
	export let score;
	export let body_html;
	export let replies = [];
	export let submissionAuthor;
	export let author_flair_type;
	export let author_flair_richtext;
	export let author_flair_text;

	let uploadDate = new Date(created_utc * 1000);

	function toggle() {
		expanded = !expanded;
		console.log(expanded);
	}

	function kFormatter(num) {
		return Math.abs(num) > 999
			? Math.sign(num) * (Math.abs(num) / 1000).toFixed(1) + 'k'
			: Math.sign(num) * Math.abs(num);
	}
</script>

<div class="commentContainer">
	<div class="topText">
		<p class={author === submissionAuthor ? 'OP' : ''}>
			{author}
			{#if author_flair_type === 'richtext'}
				<div class="flair">
					{#if author_flair_richtext[0].u}
						{#each author_flair_richtext as flair}
							{#if flair.t}
								<span>{flair.t}</span>
							{/if}
						{/each}
						{#each author_flair_richtext as flair}
							{#if flair.u}
								<img src={flair.u} alt="user flair" title={flair.a} />
							{/if}
						{/each}
					{:else}
						<span>{author_flair_richtext[0].t}</span>
					{/if}
				</div>
			{:else if author_flair_type === 'text' && author_flair_text}
				<div class="flair">
					<span>{author_flair_text}</span>
				</div>
			{/if}
		</p>
		<p>{kFormatter(score)} Points</p>
		<p>{moment(uploadDate).fromNow()}</p>
	</div>
	<div class="contentContainer">
		<span class="collapseLine" on:click={toggle}>
			<i />
			{#if !expanded}
				<span class="material-symbols-rounded" in:fly={{ y: -10 }} out:fade>
					keyboard_arrow_down
				</span>
			{/if}
		</span>
		<div class="content">
			<span class="comment">{@html body_html}</span>
			{#if replies && expanded}
				<div
					on:load={console.log(replies)}
					class="repliesContainer"
					out:slide|local={{ duration: 450, easing: cubicOut }}
					in:fly={{ y: 40, duration: 400 }}
				>
					{#each replies as reply}
						<svelte:self {...reply} {submissionAuthor} />
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>

<style lang="sass">
	.commentContainer
		display: flex
		flex-direction: column
		gap: 8px
		margin-top: 24px

	:global(.lightMode .topText)
		font-weight: 400 !important

	.topText
		display: flex
		font-size: 14px
		line-height: 20px
		font-weight: 200
		letter-spacing: .35px
		white-space: nowrap
		flex-wrap: wrap
		align-items: baseline

		&>*
			margin-right: 8px

		.OP
			color: var(--primary)
			font-weight: 400
			opacity: 1

		p
			opacity: .75
			display: flex
			gap: 8px
			align-items: baseline

			.flair
				display: flex
				justify-content: center
				align-items: center
				padding: 2px 8px
				background: var(--neutral-variant)
				white-space: nowrap
				border-radius: 20px
				gap: 4px

			img
				width: 16px
				height: 16px
				white-space: nowrap

		p:last-of-type
			opacity: .4

	.contentContainer
		display: flex

		.collapseLine
			position: relative
			min-width: 21px
			background: var(--background)
			cursor: pointer

			i
				border-left: 2px solid var(--neutral-40)
				display: block
				height: 100%
				width: 50%
				margin-left: 4px
				transition: border-left .2s ease

			&:hover i
				border-left: 2px solid var(--on-background)

			&:hover span
				color: var(--on-background)

			span
				position: absolute
				bottom: -10px
				left: -7px
				color: var(--neutral-40)
				transition: color .2s ease

		.content
			align-self: stretch
			flex-grow: 1
			max-width: 100%

	:global(.lightMode .comment)
		font-weight: 500 !important
		opacity: .8 !important

	.comment
		font-size: 16px
		line-height: 24px
		letter-spacing: .5px
		font-weight: 200
		color: var(--on-background)
		opacity: .95

		:global(li)
			margin-left: 24px
			margin-bottom: 8px

			&:last-of-type
				margin-bottom: 24px

		:global(blockquote)
			margin: 16px 16px 24px 16px

			&::before
				background: var(--neutral-variant)

		&>:global(*)
			overflow-wrap: break-word

		:global(h1)
			line-height: 40px
			margin-top: 24px
			margin-bottom: 16px

		:global(p)
			position: relative
			margin-bottom: 16px

			&:last-of-type
				margin: 0

		:global(img)
			border-radius: 16px
			overflow: hidden

	@media (max-width: 900px)
		.topText
			font-size: 11px
			flex-flow: wrap

		.comment
			font-size: 14px
			line-height: 18px

			:global(blockquote)
				margin: 8px 8px 16px 8px
				padding: 16px

		.contentContainer
			position: relative

			.content
				margin-left: 20px
				max-width: calc( 100% - 20px )

			.collapseLine
				position: absolute
				top: 0
				left: 0
				height: 100%
				width: 100%
				z-index: 2
				background: none

				&:hover i
					border-left: 2px solid var(--neutral-40)

				&:hover span
					color: var(--neutral-40)
</style>
