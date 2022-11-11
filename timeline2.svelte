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

  function topPeople(index) {
    let people = data.items
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
    if (person.name === "John Philoponus") {
      return "https://res.cloudinary.com/academicinfluence/image/upload/v1668180117/getting-started/john-philoponus-4.png";
    }
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
      } else if (influentialPeople[0].score < 107 || screenHeight <= 680) {
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

  let personFact;
  let highlightedPerson;

  $: if (previousYearIndex < currentYearIndex) {
    spin += (currentYearIndex - previousYearIndex) * 32;
    forwardInTime = true;
    previousYearIndex = currentYearIndex;
    personFact.parentElement.style = "block";
    personFact.textContent = personFact !== undefined ? displayFact() : "";
    highlightedPerson.src = highlightedPerson !== undefined ? displayImage() : "";
  } else if (previousYearIndex > currentYearIndex) {
    spin -= (previousYearIndex - currentYearIndex) * 32;
    forwardInTime = false;
    previousYearIndex = currentYearIndex;
    personFact.textContent = personFact !== undefined ? displayFact() : "";
    highlightedPerson.src = highlightedPerson !== undefined ? displayImage() : "";
  }

  /*setTimeout(function() {
    const interval = setInterval(function() {
      if (currentYearIndex === data.years.length - 2) {
        clearInterval(interval);
      }
      currentYearIndex += 1;
    }, 3000)
  }, 7000);*/

  function displayImage() {
    const year = data.years[currentYearIndex];
    let person;
    if (year >= -300 && year < 100) {
      person = topPeople(currentYearIndex).filter((person) => person.name === "Aristotle");
      return person[0].image;
    } else if (year >= 100 && year < 700) {
      person = topPeople(currentYearIndex).filter((person) => person.name === "Archimedes");
      return person[0].image;
    } else if (year >= 700 && year < 1100) {
      person = topPeople(currentYearIndex).filter((person) => person.name === "John Philoponus");
      return "https://res.cloudinary.com/academicinfluence/image/upload/v1668180117/getting-started/john-philoponus-4.png";
    } else if (year >= 1100 && year < 1500) {
      person = topPeople(currentYearIndex).filter((person) => person.name === "Avicenna");
      return person[0].image;
    } else if (year >= 1500 && year < 1800) {
      person = topPeople(currentYearIndex).filter((person) => person.name === "Nicolaus Copernicus");
      return person[0].image;
    } else if (year >= 1800 && year < 1910) {
      person = topPeople(currentYearIndex).filter((person) => person.name === "Isaac Newton");
      return person[0].image;
    } else if (year >= 1910 && year < 1970) { 
      person = topPeople(currentYearIndex).filter((person) => person.name === "Albert Einstein");
      return person[0].image;
    } else if (year >= 1970 && year < 2001) {
      person = topPeople(currentYearIndex).filter((person) => person.name === "Werner Heisenberg");
      return person[0].image;
    } else if (year >= 2001 && year < 2008) {
      person = topPeople(currentYearIndex).filter((person) => person.name === "Richard Feynman");
      return person[0].image;
    } else if (year >= 2008 && year < 2013) {
      person = topPeople(currentYearIndex).filter((person) => person.name === "Peter Higgs");
      return person[0].image;
    } else if (year >= 2013 && year < 2017) {
      person = topPeople(currentYearIndex).filter((person) => person.name === "Max Planck");
      return person[0].image;
    } else if (year >= 2017 && year < 2022) {
      person = topPeople(currentYearIndex).filter((person) => person.name === "Roger Penrose");
      return person[0].image;
    }
  }

  function displayFact() {
    const year = data.years[currentYearIndex];
    if (year >= -300 && year < 100) {
      return `"Aristotle's philosophy has exerted a unique influence on almost every form of knowledge in the West and it continues to be a subject of contemporary philosophical discussion."`
    } else if (year >= 100 && year < 700) {
      return `"Archimedes of Syracuse was a Greek mathematician, physicist, engineer, astronomer, and inventor from the ancient city of Syracuse in Sicily. Although few details of his life are known, he is regarded as one of the leading scientists in classical antiquity."`
    } else if (year >= 700 && year < 1100) {
      return `"John Philoponus broke from the Aristotelian–Neoplatonic tradition, questioning methodology and eventually leading to empiricism in the natural sciences. He was one of the first to propose a "theory of impetus" similar to the modern concept of inertia over Aristotelian dynamics."`
    } else if (year >= 1100 && year < 1500) {
      return `"Ibn Sina , commonly known in the West as Avicenna, was a Persian polymath who is regarded as one of the most significant physicians, astronomers, philosophers, and writers of the Islamic Golden Age, and the father of early modern medicine."`;
    } else if (year >= 1500 && year < 1800) {
      return `"Nicolaus Copernicus was a Renaissance polymath, active as a mathematician, astronomer, and Catholic canon, who formulated a model of the universe that placed the Sun rather than Earth at its center."`;
    } else if (year >= 1800 && year < 1910) {
      return `"Sir Isaac Newton was an English mathematician, physicist, astronomer, alchemist, theologian, and author , widely recognised as one of the greatest mathematicians and physicists of all time and among the most influential scientists."`;
    } else if (year >= 1910 && year < 1970) { 
      return `"Albert Einstein (1879-1955) was the greatest scientist of the 20th century, bar none. In fact, he’s probably the second-most original and influential scientist of all time-after Isaac Newton... But it’s close. Einstein’s later general theory of relativity revolutionized Newton’s theory of gravitation and laid the foundations for all of modern cosmology. It still stands to this day as the twin pillar of modern physics, alongside the quantum theory."`;
    } else if (year >= 1970 && year < 2001) {
      return `"Werner Karl Heisenberg was a German theoretical physicist and one of the main pioneers of the theory of quantum mechanics. He is known for the uncertainty principle, which he published in 1927. Heisenberg was awarded the 1932 Nobel Prize in Physics 'for the creation of quantum mechanics'."`;
    } else if (year >= 2001 && year < 2008) {
      return `"Richard Phillips Feynman was an American theoretical physicist, known for his work in the path integral formulation of quantum mechanics, the theory of quantum electrodynamics, the physics of the superfluidity of supercooled liquid helium, as well as his work in particle physics for which he proposed the parton model."`;
    } else if (year >= 2008 && year < 2013) {
      return `"Peter Higgs is best known for postulating the existence of a field that exists throughout all of space which gives mass to fundamental particles, now known as the Higgs Field. His early work led to the prediction of the Higgs Boson, a particle later empirically confirmed by experiment in the Large Hadron Collider located in Switzerland at CERN. His discovery is considered an important contribution to the standard model of physics."`;
    } else if (year >= 2013 && year < 2017) {
      return `"Max Karl Ernst Ludwig Planck was a German theoretical physicist whose discovery of energy quanta won him the Nobel Prize in Physics in 1918. Planck made many substantial contributions to theoretical physics, but his fame as a physicist rests primarily on his role as the originator of quantum theory, which revolutionized human understanding of atomic and subatomic processes."`;
    } else if (year >= 2017 && year < 2022) {
      return `"Sir Roger Penrose is best known for his significant contributions to the mathematical physics of general relativity and cosmology. Penrose is now widely regarded as among the greatest living mathematical physicists."`;
    }
  }

  const scheme0 = ["white", "rgb(1, 146, 201)", ""];
  const scheme1 = ["white", "rgb(231, 108, 38)", ""];
  const scheme2 = ["white", "rgb(1, 117, 161)", ""];
  const scheme3 = ["white", "rgb(255, 133, 20)", ""];
  const scheme4 = ["white", "rgb(0, 58, 82)", ""];
  const scheme5 = ["white", "rgb(247, 93, 51)", ""];
  const scheme6 = ["black", "rgb(230, 244, 250)", ""];
  const scheme7 = ["white", "rgb(208, 97, 34)", ""];
  const scheme8 = ["white", "rgba(1, 73, 101, 0.565)", ""];
  const scheme9 = ["black", "rgb(249, 184, 100)", ""];
  let colorSchemes = [scheme0, scheme1, scheme2, scheme3, scheme4, scheme5, scheme6, scheme7, scheme8, scheme9];

  function changeBGColor3(currentPerson, index) {
    let colors;
    const previousIndex = getPreviousIndex(currentPerson, index);
    const previousPeople = forwardInTime 
      ? topPeople(currentYearIndex - 1).map((person) => person.name)
      : topPeople(currentYearIndex + 1).map((person) => person.name);
    const peopleToRemove = previousPeople.filter((person) => topPeople(currentYearIndex).map((person) => person.name).indexOf(person) === -1);
    colorSchemes.forEach((scheme) => {
      scheme[2] = peopleToRemove.indexOf(scheme[2]) !== -1 ? "" : scheme[2];
    });
    const checkList = colorSchemes.some((scheme) => scheme[2] === currentPerson.name);

    if (previousIndex !== -1 && !checkList) {
      colors = colorSchemes[index];
      colorSchemes[index][2] = currentPerson.name;
    } else if (previousIndex === -1) {
      const availableColors = colorSchemes.filter((scheme) => scheme[2] === "");
      const existingPeople = colorSchemes.filter((scheme) => scheme[2] !== "").map((scheme) => scheme[2]);
      const newPeople = topPeople(currentYearIndex)
        .filter((person, i) => getPreviousIndex(person, i) === -1)
        .filter((person) => existingPeople.indexOf(person.name) === -1);
      const newIndex = newPeople.map((person) => person.name).indexOf(currentPerson.name);
      if (newIndex >= availableColors.length || availableColors.length === 0) {
        colors = colorSchemes[index];
      } else {
        colors = newIndex !== -1 ? availableColors[newIndex] : availableColors[newIndex + 1];
      }
      colorSchemes.forEach((scheme) => {
        scheme[2] = scheme[1] === colors[1] ? currentPerson.name : scheme[2];
      });
    } else {
      colors = colorSchemes.filter((scheme) => scheme[2] === currentPerson.name);
    }

    return colors;
  }

  function changeFontColor2(currentPerson, index) {
    const previousIndex = getPreviousIndex(currentPerson, index);

    if (previousIndex === -1) {
      return "rgb(255, 133, 20)";
    }

    if (index < previousIndex && previousIndex >= 0) {
      return "#0192c9";
    }

    if (index > previousIndex && previousIndex >= 0) {
      return "#003a50";
    }

    return "#0175a1";
    
    /*const targetPerson = colorSchemes.filter((scheme) => scheme[2] === currentPerson.name);
    if (targetPerson[0][1] === "rgb(249, 184, 100)" || targetPerson[0][1] === "rgb(230, 244, 250)") {
      return "black"
    }

    return "white";*/
  }

  function convertScore2(person) {
    const influentialPeople = topPeople(currentYearIndex);
    const originalScale = [influentialPeople[influentialPeople.length - 1].score, influentialPeople[0].score];
    let graphScale;
    if (influentialPeople[influentialPeople.length - 1].score > 250) {
      graphScale = [250, 925];
    } else {
      graphScale = [influentialPeople[influentialPeople.length - 1].score, 925];
    }

    return (person.score - originalScale[0]) * (graphScale[1] - graphScale[0]) / (originalScale[1] - originalScale[0]) + graphScale[0];
  }

</script>

<div class="toggle-display">
  <p class="change-display">See other version: </p>
  <input type="checkbox" id="switch" on:click={toggleVersions} />
  <label for="switch"></label>
</div>

<div class="timeline-page-content">
  <div class="timeline-container">
    <p id="current-year-2">{changeYeartoBC(data.years[currentYearIndex])}</p>
    <span class="cover-2" style="transform: rotate({spin}deg); -webkit-transform: rotate({spin}deg)" />
    <div style="display: none;" class="person-fact-2">
      <img style="position: absolute; height:5rem; width: 5rem; left: 0; bottom: -5rem;" bind:this={highlightedPerson} /> 
      <p style="margin: 0;" bind:this={personFact}></p>
      <p style="font-size:.8rem; position: absolute; bottom: -1.25rem; margin:0; color: black; right:0;">Source: Wikipedia</p>
    </div>
    <div class="timeline-graph-2" on:wheel={scrollToChangeYear}>
      {#each topPeople(currentYearIndex) as person, i (person.name)}
        <a out:fly={{ x: -300, duration: 1800, delay: 100 }} in:fly={{ y: 100 * (11 - (i+1)), duration: 2600, delay: 50 }} animate:flip|local={{ duration: 2600, delay: 25 }} class="rank-2" href="/people/{person.slug}" target="_blank">
          <img src={defaultImg(person)} style="margin-right:.25rem; width:46px; height:46px" alt="image of {person.name}" />
          <div class="grid-2 grid-ref-{i}" style="background-color:{changeBGColor3(person, i)[1]}; width:{convertScore2(person)}px"></div>
          <p class="name-plate-2" style="color:{changeFontColor2(person, i)};">{person.name}</p>
          <div style="color:{changeBGColor(person, i)}; min-width: 2rem;" class="ranking-difference-2">
            <span style="display:{displayRankDifference(person, i)[2]}; --start-rotate:{displayRankDifference(person, i)[3]}; --end-rotate:{displayRankDifference(person, i)[4]}" id="arrow-direction-{person.name}" class="arrow-direction">{displayRankDifference(person, i)[0]}</span>
            <span id="ranking-change-{person.name}">{displayRankDifference(person, i)[1]}</span>
          </div>
        </a>
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

<!--<div class="toggle-display">
  <p class="change-display">See other version: </p>
  <input type="checkbox" id="switch" on:click={toggleVersions} />
  <label for="switch"></label>
</div>
{#if (!mobileVersion && !altVersion) || (mobileVersion && altVersion)}
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

#current-year-2 {
  color: white;
  font-size: 2.5rem;
  position: absolute;
  z-index: 1;
  margin: 0;
  bottom: 3rem;
  right: 18.5rem;
  background-color: #0175a1;
  border-radius: 6px;
  padding: 1rem .75rem;
  font-weight: 600;
  box-shadow: 0 5px 15px rgba(1, 73, 101, .9);
}

.cover-2 {
  position: absolute;
  background: url(https://res.cloudinary.com/academicinfluence/image/upload/v1667925562/getting-started/square_timeline.jpg);
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  border-radius: 50%;
  filter: brightness(1);
  transition: transform linear 3s;
  width: 13rem;
  height: 13rem;
  right: 2rem;
  bottom: 0rem;
  z-index: 0;
}

.timeline-graph-2 {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
  position: relative;
  top: 0rem;
  width: 100%;
  z-index: 2;
}

.person-fact-2 {
  position: absolute;
  right: 1rem;
  bottom: 14rem;
  padding: .75rem;
  height: fit-content;
  width: 29rem;
  background-color: #0175a1;
  color: white;
  z-index: 1;
}

.rank-2 {
  display: flex;
  justify-content: center;
  align-items: center;
  max-height: 46px;
}

.grid-2 {
  height: 46px;
  display: flex;
  align-items: center;
  transition: width 2s ease;
  border-radius: 8px;
}

.name-plate-2 {
  margin: 0;
  font-size: 1rem;
  line-height: initial;
  padding: 0 .5rem;
}

.cover {
  position: absolute;
  background: url(https://res.cloudinary.com/academicinfluence/image/upload/v1667504566/getting-started/timeline_background_1.jpg);
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  border-radius: 50%;
  filter: brightness(1);
  transition: transform linear .5s;
  will-change: transform;
  width: 126%;
  height: 82rem;
  right: -14%;
  top: 0;
  bottom: 0;
  margin: auto 0;
  z-index: 0;
  
  -webkit-transition: transform linear .5s;
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