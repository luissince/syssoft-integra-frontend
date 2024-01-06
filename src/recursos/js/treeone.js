class Tree {
  constructor(element) {
    const openedClass = 'fa-minus-square';
    const closedClass = 'fa-plus-square';

    const three = document.querySelector(element);
    three.classList.add('tree');

    const button = [].filter.call(three.querySelectorAll('li'), (elem) =>
      elem.querySelector('i'),
    );

    button.forEach(function (elem) {
      elem.classList.add('branch');
      elem.querySelector('i').addEventListener('click', function () {
        if (elem.childNodes[0].classList.contains(openedClass)) {
          elem.childNodes[0].classList.replace(openedClass, closedClass);
        } else {
          elem.childNodes[0].classList.replace(closedClass, openedClass);
        }

        elem.querySelector('ul').childNodes.forEach(function (li) {
          if (li.classList.contains('display-block')) {
            li.classList.replace('display-block', 'display-none');
          } else {
            li.classList.replace('display-none', 'display-block');
          }

          if (li.querySelector('ul') === null) {
            if (
              li.querySelector('input').classList.contains('display-initial')
            ) {
              li.querySelector('input').classList.replace(
                'display-initial',
                'display-none',
              );
            } else {
              li.querySelector('input').classList.replace(
                'display-none',
                'display-initial',
              );
            }
          }
        });

        if (elem.querySelector('input').classList.contains('display-initial')) {
          elem
            .querySelector('input')
            .classList.replace('display-initial', 'display-none');
        } else {
          elem
            .querySelector('input')
            .classList.replace('display-none', 'display-initial');
        }
      });
    });

    const li = [].filter.call(three.querySelectorAll('li'), (elem) =>
      elem.querySelector('ul'),
    );

    li.forEach(function (elem) {
      elem.querySelector('ul').childNodes.forEach(function (li) {
        li.classList.add('display-none');
      });
    });

    const input = [].filter.call(three.querySelectorAll('li'), (elem) =>
      elem.querySelector('input'),
    );

    input.forEach(function (elem) {
      if (
        elem.parentNode.parentNode.tagName === 'DIV' &&
        elem.querySelector('ul') === null
      ) {
        elem.querySelector('input').classList.add('display-initial');
      } else {
        elem.querySelector('input').classList.add('display-none');
      }
    });
  }

  /**
     * 
    constructor(element) {
        this.openedClass = 'fa-minus-square';
        this.closedClass = 'fa-plus-square';
        this.treeElement = document.querySelector(element);
        this.treeElement.classList.add("tree");
        this.initializeTree();
    }

    initializeTree() {
        this.addBranchStyles();
        this.hideChildNodes();
        this.addEventListeners();
    }

    addBranchStyles() {
        const branchElements = Array.from(this.treeElement.querySelectorAll('li i'));
        branchElements.forEach(elem => elem.classList.add('branch'));
    }

    hideChildNodes() {
        const liElements = Array.from(this.treeElement.querySelectorAll('li ul'));
        liElements.forEach(elem => Array.from(elem.children).forEach(li => li.classList.add("display-none")));
    }

    addEventListeners() {
        const branchElements = Array.from(this.treeElement.querySelectorAll('li i'));
        branchElements.forEach(elem => elem.addEventListener("click", this.toggleNode.bind(this, elem)));
    }

    toggleNode(element) {
        const isOpened = element.classList.contains(this.openedClass);
        const replaceClass = isOpened ? this.openedClass : this.closedClass;
        element.classList.replace(replaceClass, isOpened ? this.closedClass : this.openedClass);

        const ulElement = element.nextElementSibling;
        if (ulElement) {
            Array.from(ulElement.children).forEach(li => li.classList.replace(isOpened ? "display-block" : "display-none", isOpened ? "display-none" : "display-block"));

            const inputElement = ulElement.closest('li').querySelector('input');
            if (inputElement) {
                inputElement.classList.replace(isOpened ? "display-initial" : "display-none", isOpened ? "display-none" : "display-initial");
            }
        }
    }
    */
}

export default Tree;
