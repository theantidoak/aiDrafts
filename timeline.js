
const container = document.querySelector('.container');
container.addEventListener('click', goToNextPerson)

function goToNextPerson() {
  removeClasses();
}

function removeClasses() {
  const people = document.querySelectorAll('.container > div');
  people.forEach((person) => {
    if (person.classList.contains('first')) {
      person.classList.remove('first');
      container.removeChild(person);
      container.appendChild(person);
    } else if (person.classList.contains('second')) {
      person.classList.remove('second');
    } else if (person.classList.contains('third')) {
      person.classList.remove('third');
    }});
  const newPeople = document.querySelectorAll('.container > div');
  addClasses(newPeople);
}

function addClasses(newPeople) {
  const first = newPeople[0];
  const second = newPeople[1];
  const third = newPeople[2];
  first.classList.add('first');
  second.classList.add('second');
  third.classList.add('third');
  determineSide(first, second, third)
} 

function determineSide(first, second, third) {
  if (first.classList.contains('left')) {
    first.style.left = '20%';
  } else if (first.classList.contains('right')) {
    first.style.right = '20%';
  }

  if (second.classList.contains('left')) {
    second.style.left = '20%';
  } else if (second.classList.contains('right')) {
    second.style.right = '20%';
  }

  if (third.classList.contains('left')) {
    third.style.left = '30%';
  } else if (third.classList.contains('right')) {
    third.style.right = '30%';
  }
}
