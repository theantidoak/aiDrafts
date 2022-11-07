<script>
  import { fly, fade } from 'svelte/transition';
  import { flip } from 'svelte/animate';
  export let data;
  let spin = 0;
  let currentYearIndex = 0;
  let previousYearIndex = currentYearIndex;
  let screenHeight = document.documentElement.clientHeight;
  let screenWidth = document.documentElement.clientWidth;
  let mobileVersion = screenWidth > 1024 ? false : true;
  let altVersion = false;
  let forwardInTime;
  const checkIfMathematicians = document.querySelector(".article-page__article h1").textContent == "Influential Mathematicians Timeline" ? true : false;
  let backCount = false;

  document.documentElement.style.overflowX = "hidden";

  function screenSizeOutput(people) {
    if (((mobileVersion && !altVersion) || (!mobileVersion && altVersion)) && screenHeight <= 455) {
      return people.slice(0, 5);
    }

    if (((mobileVersion && !altVersion) || (!mobileVersion && altVersion)) && screenHeight <= 505) {
      return people.slice(0, 6);
    }

    if (((mobileVersion && !altVersion) || (!mobileVersion && altVersion)) && screenHeight <= 560) {
      return people.slice(0, 7);
    }

    if ((screenWidth > 1024 && screenWidth <= 1148 && !mobileVersion && !altVersion) 
      || (mobileVersion && !altVersion && screenHeight <= 615)
      || (!mobileVersion && altVersion && screenHeight <= 615)) {
      return people.slice(0, 8);
    }

    if ((screenWidth > 1148 && screenWidth <= 1280 && !mobileVersion && !altVersion) 
      || (mobileVersion && !altVersion && screenHeight <= 680)
      || (!mobileVersion && altVersion && screenHeight <= 680)) {
      return people.slice(0, 9);
    }
    
    return people.slice(0, 10);
  }

  function allPeople() {
    const people = data.items
      .filter(
        (person) => person.image !== ""
      )

    const spinCover = setInterval(function() {
      spin += 8;
      if (spin === 71 * 8) {
        clearInterval(spinCover)
      }
    }, 200);
    return people;
  }

  function thisYearPeople(currentYearIndex) {
    const people2021 = topPeople(data.years.length - 1);
    let people = data.items
        .filter(
          (person) => person.image !== ""
        )
    if (currentYearIndex === 2) {
      people.forEach(
        (person) => {
          if (!people2021.map((pers) => pers.image).includes(person.image)) {
              person.hide = true;
          }
        })
    } else if (currentYearIndex === 3) {
      people = people
        .filter(
          (person) => people2021.map((pers) => pers.image).includes(person.image)
        )
    } else if (currentYearIndex === 4) {
      people = people2021
    } else {
      people = []
    }

    return people;
  }

  function fadeOut(node, params) {
    if (params.cond !== true) return;
    return {
      delay: 100,
      duration: 500,
      css: (t, u) => `opacity: ${u}`
    }
  }

  function scaleIn() {
    return {
      delay: 500,
      duration: 500,
      css: (t, u) => `scale: ${t}`
    }
  }

  function hideImages(person) {
    if (person.hide === true) {
      return 0;
    }

    return 1;
  }

  function goToLastYear() {
    currentYearIndex = data.years.length - 1;
    backCount = true;
  }

  function countBack() {
    const countingBack = setInterval(function() {
      if (currentYearIndex === 1){
        clearInterval(countingBack)
      }
      currentYearIndex -= 1;
    }, 50)
  }

  function controlSpeed(currentYearIndex) {
    if (backCount === true && currentYearIndex) {
      return "transform linear 0s";
    } else {
      return "transform linear .5s";
    }
  }

  function topPeople(index) {
    const people = data.items
      .filter(
        (person) => person.skip <= index && person.years[index - person.skip] > 0
      )
      .map((person) => ({
        ...person,
        score: person.years[index - person.skip],
      }));
    people.sort((a, b) => b.score - a.score);

    return screenSizeOutput(people);
  }

  window.addEventListener('resize', adjustToScreenSize);

  function adjustToScreenSize() {
    previousYearIndex = currentYearIndex;
    currentYearIndex = undefined;
    currentYearIndex = previousYearIndex;
    screenHeight = document.documentElement.clientHeight;
    screenWidth = document.documentElement.clientWidth;
    mobileVersion = screenWidth > 1024 ? false : true;
  }

  function toggleVersions() {
    adjustToScreenSize();
    altVersion = !altVersion;
  }

  function scrollToChangeYear(e) {
    if (mobileVersion) return;
    const input = document.querySelector("#formControlRange");
    input.value = e.deltaY < 0 ? input.valueAsNumber + 1 : input.value - 1;
    input.dispatchEvent(new Event("input", {bubbles: true}));
    e.preventDefault();
    e.stopPropagation();
  }

  function goForwardInTime() {
    if (currentYearIndex === data.years.length - 1) return;
    currentYearIndex += 1;
  }

  function goBackInTime() {
    if (currentYearIndex === 0) return;
    currentYearIndex -= 1;
  }

  function defaultImg(person) {
    if (person.image === "") {
      return "https://res.cloudinary.com/academicinfluence/image/upload/v1667505750/getting-started/Screenshot_2022-11-03_at_21.01.57.png"
    }

    return person.image;
  }

  function convertScore(person) {
    let graphScale = [124];
    const influentialPeople = topPeople(currentYearIndex);
    const originalScale = [influentialPeople[influentialPeople.length - 1].score, influentialPeople[0].score];
    if ((mobileVersion && !altVersion) || (!mobileVersion && altVersion)) {
      const screenAdjustment = screenWidth * .65;
      graphScale = [135, screenAdjustment];
    } else {
      if (influentialPeople[0].score > 400 && screenHeight > 680) {
        graphScale.push(464);
      } else if (influentialPeople[0].score < 107 || screenHeight <= 680 || (checkIfMathematicians && influentialPeople[0].score < 110)) {
        graphScale.push(250);
      } else {
        graphScale.push(influentialPeople[0].score * 1.16);
      }
    }

    return (person.score - originalScale[0]) * (graphScale[1] - graphScale[0]) / (originalScale[1] - originalScale[0]) + graphScale[0];
  }

  function modifyEndHeights(newBarHeight) {
    const heightRatio = newBarHeight / 200;
    return 50 / heightRatio;
  }

  function modifyBottomFace(newBarHeight) {
    return newBarHeight - 50;
  }

  function changeYeartoBC(year) {
    return year < 0 ? `${-year} BC` : `${year} AD`;
  }

  function getPreviousIndex(currentPerson, index) {
    let previousIndex;
    const lastYear = topPeople(currentYearIndex - 1);
    const nextYear = topPeople(currentYearIndex + 1);

    if (forwardInTime) {
      previousIndex = lastYear.map((person) => person.name).indexOf(currentPerson.name);
    } else {
      previousIndex = nextYear.map((person) => person.name).indexOf(currentPerson.name);
    }
    
    return previousIndex;
  }

  function displayRankDifference(currentPerson, index) {
    const upArrow = "\u25B2";
    const pageLoadIndex = forwardInTime;
    const previousIndex = getPreviousIndex(currentPerson, index);
    const difference = previousIndex - index;
    if (previousIndex < 0 || pageLoadIndex === undefined) {
      return ["", "", "none", "rotate(0deg)", "rotate(0deg)"];
    }

    if (difference < 0) {
      return [upArrow, difference * -1, "inline-block", "rotate(90deg)", "rotate(180deg)"];
    }
    
    if (difference > 0) {
      return [upArrow, difference, "inline-block", "rotate(90deg)", "rotate(0deg)"];
    }

    return ["", "", "none", "rotate(0deg)", "rotate(0deg)"];
  }

  function changeBGColor(currentPerson, index) {
    const previousIndex = getPreviousIndex(currentPerson, index);
    if (index < previousIndex && previousIndex >= 0) {
      return "#0192c9";
    }

    if (index > previousIndex && previousIndex >= 0) {
      return "#003a50";
    }

    return "#f6d267ef";
  }

  function highlightName(currentPerson, index) {
    if ((mobileVersion && !altVersion) || (!mobileVersion && altVersion)) {
      return "transparent";
    }

    return changeBGColor(currentPerson, index);
  }

  function highlightNameMobile(currentPerson, index) {
    if ((!mobileVersion && !altVersion) || (mobileVersion && altVersion)) {
      return;
    }

    return changeBGColor(currentPerson, index)
  }

  function changeFontColor(currentPerson, index) {
    const previousIndex = getPreviousIndex(currentPerson, index);
    if ((index < previousIndex || index > previousIndex) && previousIndex >= 0) {
      return "#ffffff";
    }

    return "#000000";
  }

  function brightenImage(currentPerson, index) {
    const previousIndex = getPreviousIndex(currentPerson, index);
    if (previousIndex != index && previousIndex != -1) {
      return 75;
    }

    return 100;
  }

  function spaceOutGraph(i) {
    let left;
    let top;
    if (!mobileVersion) {
      left = !altVersion ? `${i * 110}` : "0";
      top = !altVersion ? "initial" : `${(i * 53)}`;
    } else {
      left = !altVersion ? "0" : `${i * 110}`;
      top = !altVersion ? `${(i * 53)}` : "initial";
    }

    return [left, top];
  }

  function flyScaleOut(node, params) {
    if (forwardInTime) {
      return {
        delay: 100,
        duration: 500,
        css: (t, u) => `transform: translateX(${u * screenWidth/2 * -1}px) scale(${t}) rotateX(-5deg) rotateY(-1deg) rotateZ(90deg); opacity: ${t}`
      }
    }

    return {
      delay: 100,
      duration: 500,
      css: (t, u) => `transform: translateX(${u * screenWidth/2}px) scale(${u+1}) rotateX(-5deg) rotateY(-1deg) rotateZ(90deg); opacity: ${t}`
    }
  }

  function flyScaleIn(node, params) {
    if (forwardInTime) {
      return {
        delay: 100,
        duration: 500,
        css: (t, u) => `transform: translateX(${u * screenWidth/2}px) scale(${u+1}) rotateX(-5deg) rotateY(-1deg) rotateZ(90deg); opacity: ${t}`
      }
    }

    return {
      delay: 100,
      duration: 500,
      css: (t, u) => `transform: translateX(${u * screenWidth/2 * -1}px) scale(${t}) rotateX(-5deg) rotateY(-1deg) rotateZ(90deg); opacity: ${t}`
    }
  }

  $: if (previousYearIndex < currentYearIndex) {
    
    forwardInTime = true;
    previousYearIndex = currentYearIndex;
  } else if (previousYearIndex > currentYearIndex) {
    spin -= (previousYearIndex - currentYearIndex) * 8;
    forwardInTime = false;
    previousYearIndex = currentYearIndex;
  }
</script>

<button on:click={goToLastYear}>Last Year</button>
<button on:click={countBack}>Count back</button>

<div class="toggle-display">
  <p class="change-display">See other version: </p>
  <input type="checkbox" id="switch" on:click={toggleVersions} />
  <label for="switch"></label>
</div>

<div class="timeline-page-content" in:fade={{ duration: 200, delay: 700 }} out:fly={{ x: 500, duration: 750 }}>
  <div class="timeline-container">
    <span class="cover" style="-webkit-transition: {controlSpeed(currentYearIndex)}; transition: {controlSpeed(currentYearIndex)}; transform: rotate({spin}deg); -webkit-transform: rotate({spin}deg)" />
    {#if backCount === true && currentYearIndex !== 0}
    <p out:scaleIn in:scaleIn id="current-year" style="transform: scale(3); top: 0; right: 0; bottom: 0; left: 0; width: fit-content; height: fit-content; margin: auto">{changeYeartoBC(data.years[currentYearIndex])}</p>
    {:else if currentYearIndex === 1}
    <div class="timeline-graph-video" on:wheel={scrollToChangeYear}>
      {#each allPeople() as person, i (person.name)}
        <img src={person.image} width="64" height="64" alt=" " in:fly={{ x: -1000, duration: 500, delay: i*200 }} />
      {/each}
    </div>
    {:else if currentYearIndex !== 0}
    <div class="timeline-graph-video" on:wheel={scrollToChangeYear}>
      {#each thisYearPeople(currentYearIndex) as person, i (person.name)}
        <img src={person.image} width="64" height="64" alt=" " in:fadeOut={{cond: person.hide}} out:fade={{ duration: 500 }} animate:flip={{ duration: 750 }} style="opacity:{hideImages(person)}" />
      {/each}
    </div>
    {:else if backCount === true && currentYearIndex === 0}
    <p in:scaleIn id="current-year">{changeYeartoBC(data.years[currentYearIndex])}</p>
    <div in:fly={{ y: 500, duration: 500, delay: 1000 }} class="timeline-graph" on:wheel={scrollToChangeYear}>
      {#each topPeople(currentYearIndex) as person, i (person.name)}
        <div 
          animate:flip|local={{ duration: 500, delay: 25 }}
          style="left:{spaceOutGraph(i)[0]}px; top:{spaceOutGraph(i)[1]}px;" 
          class="rank" 
          id="rank-{i+1}"
        >
          <div out:fly={{ y: 100, duration: 300, delay: 100 }} in:fly={{ y: 100, duration: 500, delay: 50 }} class="person-data">
            <div style="background-color:{changeBGColor(person, i)}" class="ranking-difference">
              <span style="display:{displayRankDifference(person, i)[2]}; --start-rotate:{displayRankDifference(person, i)[3]}; --end-rotate:{displayRankDifference(person, i)[4]}" id="arrow-direction-{person.name}" class="arrow-direction">{displayRankDifference(person, i)[0]}</span>
              <span id="ranking-change-{person.name}">{displayRankDifference(person, i)[1]}</span>
            </div>
            <a href="/people/{person.slug}" target="_blank">
              <img src={defaultImg(person)} width="64" height="64" alt="image of {person.name}" />
            </a>
          </div>
          <div out:fly={{ y: 100, duration: 10, delay: 100 }} class="grid grid-left" id="grid-{i+1}" style="height:{convertScore(person)}px">
            <div class="face front"></div>
            <div class="face back" style="background-color:{highlightNameMobile(person, i)}">
              <p class="name-plate" id="{person.name}" style="color:{changeFontColor(person, i)}; background-color:{highlightName(person, i)}">{person.name}</p>
            </div>
            <div class="face right"></div>
            <div class="face left"></div>
            <div class="face top" style="height:{modifyEndHeights(convertScore(person))}%"></div>
            <div class="face bottom" style="height:{modifyEndHeights(convertScore(person))}%; transform: rotateX(-90deg) translateZ({modifyBottomFace(convertScore(person))}px);"></div>
          </div>
        </div>
      {/each}
    </div>
    {/if}
  </div>

  <div class="control-buttons">
    <button type="button" on:click={goBackInTime}>Reverse</button>
    <button type="button" on:click={goForwardInTime}>Forward</button>
    <input
      id="formControlRange"
      type="range"
      min=0
      max={data.years.length - 1}
      bind:value={currentYearIndex}
    />
  </div>
</div>


<!--{#if (!mobileVersion && !altVersion) || (mobileVersion && altVersion)}
<div class="timeline-page-content" in:fade={{ duration: 200, delay: 700 }} out:fly={{ x: 500, duration: 750 }}>
  <div class="timeline-container">
    <p id="current-year">{changeYeartoBC(data.years[currentYearIndex])}</p>
    <span class="cover" style="transform: rotate({spin}deg); -webkit-transform: rotate({spin}deg)" />
    <div class="timeline-graph" on:wheel={scrollToChangeYear}>
      {#each topPeople(currentYearIndex) as person, i (person.name)}
        <div 
          animate:flip|local={{ duration: 500, delay: 25 }}
          style="left:{spaceOutGraph(i)[0]}px; top:{spaceOutGraph(i)[1]}px;" 
          class="rank" 
          id="rank-{i+1}"
        >
          <div out:fly={{ y: 100, duration: 300, delay: 100 }} in:fly={{ y: 100, duration: 500, delay: 50 }} class="person-data">
            <div style="background-color:{changeBGColor(person, i)}" class="ranking-difference">
              <span style="display:{displayRankDifference(person, i)[2]}; --start-rotate:{displayRankDifference(person, i)[3]}; --end-rotate:{displayRankDifference(person, i)[4]}" id="arrow-direction-{person.name}" class="arrow-direction">{displayRankDifference(person, i)[0]}</span>
              <span id="ranking-change-{person.name}">{displayRankDifference(person, i)[1]}</span>
            </div>
            <a href="/people/{person.slug}" target="_blank">
              <img src={defaultImg(person)} width="64" height="64" alt="image of {person.name}" />
            </a>
          </div>
          <div out:fly={{ y: 100, duration: 10, delay: 100 }} class="grid grid-left" id="grid-{i+1}" style="height:{convertScore(person)}px">
            <div class="face front"></div>
            <div class="face back" style="background-color:{highlightNameMobile(person, i)}">
              <p class="name-plate" id="{person.name}" style="color:{changeFontColor(person, i)}; background-color:{highlightName(person, i)}">{person.name}</p>
            </div>
            <div class="face right"></div>
            <div class="face left"></div>
            <div class="face top" style="height:{modifyEndHeights(convertScore(person))}%"></div>
            <div class="face bottom" style="height:{modifyEndHeights(convertScore(person))}%; transform: rotateX(-90deg) translateZ({modifyBottomFace(convertScore(person))}px);"></div>
          </div>
        </div>
      {/each}
    </div>
  </div>
  <div class="control-buttons">
    <button type="button" on:click={goBackInTime}>Reverse</button>
    <button type="button" on:click={goForwardInTime}>Forward</button>
    <input
      id="formControlRange"
      type="range"
      min=0
      max={data.years.length - 1}
      bind:value={currentYearIndex}
    />
  </div>
</div>
{:else}
<div class="timeline-page-content mobile" in:fade={{ duration: 200, delay: 700 }} out:fly={{ x: -500, duration: 750 }}>
  <div class="timeline-container mobile">
    <p id="current-year" class="mobile">{changeYeartoBC(data.years[currentYearIndex])}</p>
    <span class="cover mobile" style="transform: rotate({spin}deg); -webkit-transform: rotate({spin}deg)" />
    <div class="timeline-graph mobile" on:wheel={scrollToChangeYear}>
      {#each topPeople(currentYearIndex) as person, i (person.name)}
        <div 
          animate:flip|local={{ duration: 500, delay: 25 }}
          style="left:{spaceOutGraph(i)[0]}px; top:{spaceOutGraph(i)[1]}px;" 
          class="rank mobile" 
          id="rank-{i+1}"
        >
          <div class="person-data mobile" out:fade={{ duration: 10, delay: 25 }}>
            <div style="background-color:{changeBGColor(person, i)}" class="ranking-difference mobile">
              <span style="display:{displayRankDifference(person, i)[2]}; --start-rotate:{displayRankDifference(person, i)[3]}; --end-rotate:{displayRankDifference(person, i)[4]}" id="arrow-direction-{person.name}" class="arrow-direction mobile">{displayRankDifference(person, i)[0]}</span>
              <span id="ranking-change-{person.name}" class="mobile">{displayRankDifference(person, i)[1]}</span>
            </div>
            <a href="/people/{person.slug}" target="_blank">
              <img class="mobile" src={defaultImg(person)} width="64" height="64" alt="image of {person.name}" style="filter: brightness({brightenImage(person, i)}%)" />
            </a>
          </div>
          <div out:flyScaleOut in:flyScaleIn class="grid grid-left mobile" id="grid-{i+1}" style="height:{convertScore(person)}px">
            <div class="face front mobile"></div>
            <div class="face back mobile" style="background-color:{highlightNameMobile(person, i)}">
              <p class="name-plate mobile" id="{person.name}" style="color:{changeFontColor(person, i)}; background-color:{highlightName(person, i)}">{person.name}</p>
            </div>
            <div class="face right mobile"></div>
            <div class="face left mobile"></div>
            <div class="face top mobile" style="height:{modifyEndHeights(convertScore(person))}%"></div>
            <div class="face bottom mobile" style="height:{modifyEndHeights(convertScore(person))}%; transform: rotateX(-90deg) translateZ({modifyBottomFace(convertScore(person))}px);"></div>
          </div>
        </div>
      {/each}
    </div>
  </div>
  <div class="control-buttons mobile">
    <button class="mobile" type="button" on:click={goBackInTime}>Reverse</button>
    <button class="mobile" type="button" on:click={goForwardInTime}>Forward</button>
    <input
      id="formControlRange"
      type="range"
      min=0
      max={data.years.length - 1}
      bind:value={currentYearIndex}
    />
  </div> 
</div>
{/if}-->

<style>
.timeline-graph-video {
  height: 100%;
  width: 100%;
  display: flex;
  margin: 0 auto;
  justify-content: flex-start;
  align-items: flex-start;
  flex-wrap: wrap;
  z-index: 5;
  position: relative;
  gap: 1.5rem;
  padding: 2rem;
}

:root {
  --start-translate: translateY(200px);
  --end-translate: translateY(0px);
}

.toggle-display {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: .5rem;
}

.change-display {
  margin: 0;
  font-weight: bold;
}

input[type=checkbox]{
  height: 0;
  width: 0;
  visibility: hidden;
}

input[type=checkbox] + label {
  cursor: pointer;
  width: 50px;
  height: 25px;
  background-color: #0192c9;
  display: block;
  border-radius: 100px;
  position: relative;
}

input[type=checkbox] + label:after {
  content: '';
  position: absolute;
  top: 1px;
  left: 2px;
  width: 22px;
  height: 22px;
  background: #ff8514;
  border-radius: 90px;
  transition: transform ease 0.2s;
}

input[type=checkbox]:checked + label {
  background-color: #0192c9;
}

input[type=checkbox]:checked + label:after {
  left: calc(100% - 2px);
  transform: translateX(-100%);
}

input[type=checkbox] + label:active:after {
  width: 40px;
}

.timeline-page-content {
  height: 44rem;
}

.timeline-container {
  margin: 0 auto;
  overflow: hidden; 
  height: 39rem;
  width: min(89vw, 71.5rem);
  max-width: 71.5rem;
  position: absolute;
  left: 0;
  right: 0;
}

.timeline-container > * {
  box-sizing: border-box;
}

#current-year {
  color: white;
  font-size: 2.5rem;
  position: absolute;
  z-index: 1;
  top: 1rem;
  right: 1rem;
  background-color: #0175a1;
  border-radius: 6px;
  padding: 1rem .75rem;
  font-weight: 600;
  box-shadow: 0 5px 15px rgba(1, 73, 101, .9);
}

.cover {
  position: absolute;
  background: url(https://res.cloudinary.com/academicinfluence/image/upload/v1667504566/getting-started/timeline_background_1.jpg);
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  border-radius: 50%;
  filter: brightness(.65);
  will-change: transform;
  width: 126%;
  height: 82rem;
  right: -14%;
  top: 0;
  bottom: 0;
  margin: auto 0;
  z-index: 0;
  
  -webkit-will-change: transform;
  --moz-backface-visibility: hidden;
  -ms-backface-visibility: hidden;
  backface-visibility: hidden;
  -webkit-transform-style: preserve-3d;
  -moz-transform-style: preserve-3d;
  -webkit-font-smoothing: antialiased;
  -webkit-font-smoothing: subpixel-antialiased;
  -webkit-text-stroke: 0.35px;
}

.timeline-graph {
  display: flex;
  align-items: flex-end;
  gap: 2rem;
  position: relative;
  width: 100%;
  height: 100%;
  margin: 0 2rem;
  padding: 0 0 1rem;
}

.rank {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: absolute;
}

.person-data {
  position: absolute;
  top: -7rem;
  z-index: 2;
}

.arrow-direction {
  font-size: 1rem;
  transition: transform ease-in .5s; 
  animation: .5s ease-in both running rotateTriangle;
  transition: all .5s ease-in;
}

@keyframes rotateTriangle {
  0% { transform: var(--start-rotate) }
  100% { transform: var(--end-rotate) }
}

.person-data .ranking-difference {
  position: absolute;
  width: fit-content;
  color: white; 
  font-size: 1.25rem;
  top: -1.85rem;
  left: 0;
  right: 0;
  margin: 0 auto;
  padding: 0 .5rem;
  line-height: 1.5rem;
  border-radius: 6px;
}

.person-data img {
  width: 6rem;
  height: 6rem;
  filter: drop-shadow(-2px -2px 10px #87ceeb99);
  border-radius: 8px;
}

.grid {
  width: 88px;
  perspective: 2500px;
  perspective-origin: 500% 80%;
  transform-style: preserve-3d;
  transform: rotateX(2deg) rotateY(3deg);
  transition: height .5s ease;
}

.grid .face {
  width: 100%;
  height: 100%;
  position: absolute;
  backface-visibility: inherit;
}

.grid .front {
  transform: translateZ(50px);
  border-left: 1px solid #f75d33;
}

.grid .back {
  transform: rotateY(180deg) translateZ(50px);
  border-top: 3px solid #f75d33;
  border-right: 3px solid #f75d33;
  border-bottom: 3px solid #f75d33;
  border-left: 3px solid #f75d33;
  background-color: #0175a1;
}

.grid .back .name-plate {
  font-size: .7rem;
  color: black;
  text-align: center;
  transform: scale(-1, 1);
  background-color: #f6d267ef;
  width: 100%;
  margin: .5rem 0 0;
  word-break: break-word;
}

.grid .right {
  width: 115%;
  transform: rotateY(90deg) translateZ(25px);
}

.grid .left {
  width: 115%;
  transform: rotateY(-90deg) translateZ(50px);
  border-bottom: 3px solid #f75d33;
  background-color: rgba(1, 73, 101, .9);
}

.grid .top {
  transform: rotateX(90deg) translateZ(50px);
  transition: height .5s ease;
  border-top: 2px solid #f75d33;
  border-right: 2px solid #f75d33;
  border-left: 2px solid #f75d33;
  box-shadow: inset 0px -40px 20px silver;
  background-color: aliceblue;
}

.grid .bottom {
  transition: height .5s ease, transform .5s ease;
}

.control-buttons {
  position: relative;
  width: 100%;
  top: 39.5rem;
  left:0;
  right:0;
  margin: .25rem auto;
  display: flex;
  flex-wrap: wrap;
  gap: .5rem;
  justify-content: center;
  align-items: center;
}

.control-buttons button {
  border: 2px solid #ff8514;
  background-color: #0192c9;
  color: white;
  margin: 0 1rem;
  width: 5rem;
  padding: .25rem;
  border-radius: 15px;
}

.control-buttons button:hover {
  background-color: rgba(1, 73, 101);
  transform: scale(1.05);
} 

#formControlRange {
  display: block;
  width: 100%;
  -webkit-appearance: none;
  background-color: #0192c9;
  height: .8rem;
  border-radius: 2px;
  cursor: pointer;
}

#formControlRange::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 1.25rem;
  height: 1.25rem;
  background-color: #ff8514;
  border-radius: 50%;
}
  
#formControlRange::-moz-range-thumb {
  width: 1.25rem;
  height: 1.25rem;
  background-color: #ff8514;
  border-radius: 50%;
}

.timeline-page-content.mobile {
  height: min(37.75rem, calc(100vh - 4rem));
}

.timeline-container.mobile {
  height: min(33.75rem, calc(100vh - 8rem));
  width: 89vw;
}

.control-buttons.mobile {
  top: calc(100% - 3.5rem);
}

.control-buttons button.mobile {
  font-size: .8rem;
  padding: .1rem;
}

#current-year.mobile {
  top: initial;
  bottom: .25rem;
  font-size: clamp(1.1rem, 5vw, 2rem);
  padding: .25rem;
  width: min-content;
  text-align: center;
  right: .25rem;
  line-height: 2rem;
  border: 2px solid white;
  margin: 0;
  background-color: #0175a190;
}

.timeline-graph.mobile {
  width: 85%;
  margin: .5rem auto 0;
  position: relative;
  left: 2rem;
}

.rank.mobile {
  flex-direction: row;
  height: 3rem;
  margin: 0 auto;
  width: 3rem;
  position: absolute;
  right: 0px;
  animation: none;
}

.person-data.mobile {
  top: initial;
  left: max(-32rem, -43vw);
}

.person-data .ranking-difference.mobile {
  width: max-content;
  top: .75rem;
  z-index: 1;
}

.person-data img.mobile {
  height: 3rem;
  width: 3rem;
  filter: brightness(45%);
}

.grid.mobile {
  transform: rotateX(-5deg) rotateY(-1deg) rotateZ(90deg);
  min-width: 3rem;
  width: 3rem;
}

.grid .front.mobile {
  border: none;
}

.grid .back.mobile {
  overflow-y: auto;
  background-color: #f6d267ef;
  border-top: 2px solid #f75d33;
  border-right: 2px solid #f75d33;
  border-bottom: 2px solid #f75d33;
  border-left: 2px solid #f75d33;
}

.grid .back .name-plate.mobile {
  transform: scaleX(-1) rotate(180deg);
  writing-mode: vertical-rl;
  margin: auto;
  padding: .5rem 0;
  line-height: 16px;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  color: white;
  font-size: .85rem;
  font-weight: 700;
  width: fit-content;
  background-color: transparent;
}

.grid .left.mobile {
  width: 208%;
  border: none;
}

.grid .right.mobile {
  width: 208%;
}

.grid .top.mobile {
  display: none;
}

.grid .bottom.mobile {
  border-top: 2px solid #f75d33;
  border-right: 2px solid #f75d33;
  border-left: 2px solid #f75d33;
  background-color: aliceblue;
  display: none;
}

@media (max-width: 1280px) {
  .timeline-container {
    width: min(89vw, 64.5rem);
  }
}

@media (max-width: 1148px) {
  .timeline-container {
    width: min(89vw, 57.5rem);
  }
}

@media (max-width: 1024px) {
  .timeline-graph:not(.mobile) {
    overflow-x: auto;
    margin: 0 1rem;
  }
}

@media (max-width: 790px) {
  .cover {
    width: 200vw;
    right: -63%;
  }
}

@media (max-height: 680px) and (max-width: 1024px) {
  .timeline-page-content {
    height: min(35.75rem, calc(100vh - 4rem));
  }

  .timeline-container {
    height: min(30.75rem, calc(100vh - 8rem));
    width: 89vw;
  }

  .control-buttons {
    top: calc(100% - 3.5rem);
  }

  .control-buttons button {
    font-size: .8rem;
    padding: .1rem;
  }
}
</style>