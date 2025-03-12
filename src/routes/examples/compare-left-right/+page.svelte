<!-- +page.svelte -->
<script>
  import { CompareLeftRight } from '$lib/widgets/compare-left-right/index.js';

  // Raw images

  import ArmyGreenRaw from '../assets/images/army-green.jpg?raw';

  import ElectricBlueRaw from '../assets/images/electric-blue.jpg?raw';

  // Imagebox images

  import ArmyGreen from '../assets/images/army-green.jpg?preset=gradient';

  import ElectricBlue from '../assets/images/electric-blue.jpg?preset=gradient';

  import ImageBox from '$lib/components/image/ImageBox.svelte';
</script>

<CompareLeftRight width="w-[90vw]">
  {#snippet leftContent()}
    <img
      src={ArmyGreenRaw}
      alt="Landscape before editing"
      class="h-full w-full object-cover"
    />
  {/snippet}

  {#snippet rightContent()}
    <img
      src={ElectricBlueRaw}
      alt="Landscape after editing"
      class="h-full w-full object-cover"
    />
  {/snippet}
</CompareLeftRight>

<br />

<CompareLeftRight width="w-[90vw]" height="h-[200px]">
  {#snippet leftContent()}
    <div class="prose p-8">
      <h3>Contract Version 1</h3>
      <p>
        The party of the first part hereby agrees to deliver the specified goods
        within 30 days of receipt of payment. All deliveries will be made during
        normal business hours, Monday through Friday.
      </p>
    </div>
  {/snippet}

  {#snippet rightContent()}
    <div class="prose p-8">
      <h3>Contract Version 2</h3>
      <p>
        The party of the first part hereby agrees to deliver the specified goods
        within 14 days of receipt of payment. All deliveries will be made during
        extended business hours, Monday through Saturday.
      </p>
    </div>
  {/snippet}
</CompareLeftRight>

<br />

<CompareLeftRight width="w-[90vw]" height="h-[200px]">
  {#snippet leftContent()}
    <ImageBox
      imageMeta={ArmyGreen}
      fit="contain"
      position="center center"
      width="w-full"
      height="h-[200px]"
      classes="border-8 border-green-500"
    />
  {/snippet}

  {#snippet rightContent()}
    <ImageBox
      imageMeta={ElectricBlue}
      fit="contain"
      position="center center"
      width="w-full"
      height="h-[200px]"
      classes="border-8 border-green-500"
    />
  {/snippet}
</CompareLeftRight>

<br />
