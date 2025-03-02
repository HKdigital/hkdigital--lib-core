<script>
  import Button from '$lib/components/buttons/button/Button.svelte';
  import TextBlock from '$lib/components/hkdev/blocks/TextBlock.svelte';
  import CheckButton from '$lib/components/hkdev/buttons/CheckButton.svelte';
    import TextInput from '$lib/components/inputs/text-input/TextInput.svelte';
  import { onMount } from 'svelte';

  onMount(() => {
    function updateScaleValues() {
      // Same function as above
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      const scaleW = vw / 1920;
      const scaleH = vh / 1080;

      const scaleViewport = Math.min(scaleW, scaleH);

      const scaleUI = Math.max(0.3, Math.min(scaleViewport, 2));
      const scaleTextContent = Math.max(0.75, Math.min(scaleViewport, 1.5));
      const scaleTextHeading = Math.max(0.75, Math.min(scaleViewport, 2.25));
      const scaleTextUi = Math.max(0.5, Math.min(scaleViewport, 1.25));

      document.documentElement.style.setProperty('--scale-w', String(scaleW));
      document.documentElement.style.setProperty('--scale-h', String(scaleH));
      document.documentElement.style.setProperty(
        '--scale-viewport',
        String(scaleViewport)
      );
      document.documentElement.style.setProperty('--scale-ui', String(scaleUI));
      document.documentElement.style.setProperty(
        '--scale-text-content',
        String(scaleTextContent)
      );
      document.documentElement.style.setProperty(
        '--scale-text-heading',
        String(scaleTextHeading)
      );
      document.documentElement.style.setProperty(
        '--scale-text-ui',
        String(scaleTextUi)
      );
    }

    updateScaleValues();
    window.addEventListener('resize', updateScaleValues);

    return () => {
      window.removeEventListener('resize', updateScaleValues);
    };
  });

  const buttons = [
    { title: 'Toepassingen voor bedrijven' },
    { title: 'Toepassingen voor scholen' },
    { title: 'Toepassingen voor evenementen' },
    { title: 'Gamification' },
    { title: 'Mini-games' },
    { title: 'Iets anders' }
  ];
</script>
<div class="w-screen h-full justify-center flex  bg-blue-950 text-white">
<div class="px-20p w-10/12 h-full bg-blue-950 text-white">

    <h1 class="h1 font-bold text-surface-50">CONTACT</h1>
    <div>
      <div class="mb-5">
        <p class="text-surface-50">Ik heb een vraag over:</p>
      </div>
  
      <div class="flex flex-col space-y-4">
        <div class="flex w-full flex-wrap gap-4 md:w-11/12">
          {#each buttons as button}
            <CheckButton
              title={button.title}
              classes="rounded-full text-surface-50 font-bold"
              inactiveChild={true}
              activeChild={true}
              activeClasses="bg-tertiary-500"
              inactiveClasses="border-tertiary-300 border-2"
              topic={button.title}
            
            />
          {/each}
        </div>
      </div>
    </div>
    <div class="my-5 h-[3px] w-full rounded-md bg-tertiary-950"></div>
      <p class="mb-10p text-surface-100">
        Vul het onderstaande formulier in en we nemen binnen één werkdag contact
        met je op!
      </p>
      <form
        method="post"
        action="/contact"
      >
        <div class="mb-5p">
          <!-- svelte-ignore a11y_label_has_associated_control -->
          <label class="mb-2 block text-surface-50"
            >Aanhef<span class="text-tertiary-200">*</span></label
          >
          <div class="flex space-x-4">
            <label
              data-hk-form-radio
              class="inline-flex items-center text-surface-50"
            >
              <input
                type="radio"
                name="aanhef"
                value="de heer"
                class="checked:bg-primary-500"
                required
              />
              <span class="ml-2 text-surface-50">De heer</span>
            </label>
            <label
              data-hk-form-radio
              class="inline-flex items-center text-surface-50"
            >
              <input
                type="radio"
                name="aanhef"
                value="mevrouw"
                required
              />
              <span class="ml-2">Mevrouw</span>
            </label>
            <label
              data-hk-form-radio
              class="inline-flex items-center text-surface-50"
            >
              <input
                type="radio"
                name="aanhef"
                value="geen"
                required
              />
              <span class="ml-2">Geen</span>
            </label>
          </div>
        </div>
        <div class="mb-30p gap-20p flex flex-col sm:flex-row">
          <div class="md:w-1/2">
            <TextInput

              type="text"
              name="name"
              required
              title="Voornaam"
              placeholder="Voornaam"
            />
          </div>
          <div class="md:w-1/2">
            <TextInput

              type="text"
              name="surname"
              required
              title="Achternaam"
              placeholder="Achternaam"
            />
          </div>
        </div>
  
        <div class="mb-30p gap-30p flex flex-col sm:flex-row">
          <div class="md:w-1/2">
            <TextInput

              type="text"
              required
              name="phonenumber"
              title="telefoonnummer"
              placeholder="06.."
            />
          </div>
          <div class="md:w-1/2">
            <TextInput
              type="text"
              name="email"
              required
              title="email"
              placeholder="jouw@mail.nl"
            />
          </div>
        </div>
  
        <div class="mb-4">
          <label for="voorkeur" class="mb-2 block text-surface-50"
            >Voorkeur<span class="text-tertiary-200">*</span></label
          >
          <div class="flex flex-col space-y-2">
            <label
              data-hk-form-radio
              class="inline-flex items-center text-surface-50"
            >
              <input
                type="radio"
                name="voorkeur"
                value="bellen"
                class="form-radio text-primary-500 checked:bg-primary-500 checked:accent-primary-500"
                required
              />
              <span class="ml-2">Bellen</span>
            </label>
            <label
              data-hk-form-radio
              class="inline-flex items-center text-surface-50"
            >
              <input
                type="radio"
                name="voorkeur"
                value="email"
                class="form-radio text-primary-500 checked:accent-primary-500"
                required
              />
              <span class="ml-2">Email</span>
            </label>
          </div>
        </div>
  
        <div class="mb-4">
          <label class="mb-2 block text-surface-50" for="bericht"
            >Bericht<span class="text-tertiary-200">*</span></label
          >
          <div
            id="bericht"
            contenteditable="true"
            class="h-[150px] w-full rounded-sm border-gray-300 bg-white p-2 text-surface-950 dark:bg-surface-800"
          >
            <textarea
              class="hidden"
              id="hiddeninput"
              name="hiddeninput"
            ></textarea>
            Ik heb een vraag over
            <span class="text-primary-500"
              >Blababa</span
            >. Wil jij contact met mij opnemen?
          </div>
        </div>
          <div class="mt-4 flex justify-end">
            <Button role="primary" disabled
              >Versturen</Button
            >
          </div>
      </form>
</div>
</div>