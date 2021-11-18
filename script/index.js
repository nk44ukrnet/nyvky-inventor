(function () {
    //current year
    let currentYear = document.querySelectorAll('.currentYear');
    if (currentYear) {
        for (let year of currentYear) {
            year.innerHTML = new Date().getFullYear() + '';
        }
    }
    //hamburger menu
    let navMenu = document.querySelector('.header__nav'),
        navMenuActiveClass = 'header__active',
        navHamburger = document.getElementById('navHamburger');

    let navMenuOffset = navMenu.offsetTop;

    function stickyNav() {
        if (window.pageYOffset >= navMenuOffset + 10) {
            if (!navMenu.classList.contains("header__nav-fixed")) navMenu.classList.add("header__nav-fixed")
        } else {
            if (navMenu.classList.contains("header__nav-fixed")) navMenu.classList.remove("header__nav-fixed");
        }
    }

    window.addEventListener('scroll', stickyNav);

    document.body.addEventListener('click', function (e) {
        if(!e.target.closest('.header__ul') || e.target.classList.contains('header__link')) {
            if (navMenu.classList.contains(navMenuActiveClass)) navMenu.classList.remove(navMenuActiveClass);
        }
    });

    try {
        navHamburger.addEventListener('click', function (e) {
            e.stopPropagation();
            navMenu.classList.toggle(navMenuActiveClass);
        })
    } catch (e) {
        console.log(e);
    }

    //smooth scrolling from header nav
    let headerUl = document.querySelector('.header__ul');
    headerUl.addEventListener('click', function (e) {
        let current = e.target;
        if (current.classList.contains('header__link')) {
            e.preventDefault();
            let hrefAttr = current.getAttribute('href');
            let targetItem = document.querySelector(hrefAttr)
            if (targetItem) {
                let headerUlParent = current.closest('.header__nav');
                let headerUlParentHeight = headerUlParent.offsetHeight;
                let targetItemTop = targetItem.offsetTop;
                window.scrollTo(0, (targetItemTop - headerUlParentHeight),
                    {behavior: 'smooth'}
                )
            }
        }
    })

    //sending form
    let documentForm = document.forms['send-to-google-sheet'];
    if (documentForm) {
        documentForm.addEventListener('submit', e => {
            e.preventDefault();
            let btn = documentForm.querySelector('button[type="submit"]');
            btn.disabled = true;
            const form1result = document.querySelector('#form1result');
            form1result.innerHTML = 'Надсилаємо форму...';
            fetch('https://script.google.com/macros/s/AKfycbxp_ARWh28mKoQtjpk7GSXmlZa_V4bACidp_xvRiKFSxNXOV31XzX9W_NIS5NWYKIpMmA/exec', {
                method: 'post',
                body: new FormData(documentForm)
            })
                .then(res => {
                    if (res.ok && (res.status <= 200 && res.status < 300)) {
                        form1result.innerHTML = 'Форму успішно надіслано!';
                        console.log(res);
                        documentForm.reset();
                    } else {
                        throw new Error('Помилка, не вдалося надіслати форму!');
                    }
                })
                .catch(err => {
                    form1result.innerHTML = 'Не вдалося надіслати форму. Виникла помилка серверу. Спробуйте пізніше';
                    console.log(err);
                })
                .finally(after => {
                    btn.disabled = false;
                    setTimeout(() => {
                        form1result.innerHTML = '';
                    }, 5000)
                })
        })
    }

    // news
    //news template
    function newsTemplate({date, title, text}) {
        return `
        <div class="news__item">
                    <h4 class="fs-5 text">${title} <code>${date}</code></h4>
                    <div>
                        ${text}
                    </div>
                </div>
        `;
    }

    //
    let news = document.getElementById('news'),
        newsInner = document.getElementById('newsInner'),
        newsPagination = news.querySelector('.pagination');
    //try to fetch news
    fetch('https://opensheet.vercel.app/152DauEcmrDXYZnVjrDrXN_CpBcXT-2N2Nv-oIIn2RbE/news')
        .then(res => {
            if (res.ok) {
                return res.json()
            } else {
                throw new Error('не вдалося завантажити новини...')
            }
        })
        .then(res => {
            const arr = res;
            newsInner.innerHTML = '';
            if (arr.length > 3) {
                try {
                newsPaginationStart(arr, newsPagination);
                } catch (e) {
                    console.log('Pagination function error!');
                    throw new Error('Pagination function error!')
                }
            } else {
                newsPagination.remove();
                let newsHTMLStr = '';
                for (let item of arr.reverse()) {
                    newsHTMLStr += newsTemplate(
                        {
                            date: item.date,
                            title: item.title,
                            text: item.text
                        })
                }
                newsInner.innerHTML = newsHTMLStr;
            }
        })
        .catch(err => {
            console.log(err);
            newsInner.innerHTML = `Не вдалося завантажити новини...`
            // news.classList.add('d-none');
        })

    function newsPaginationStart(arr, paginationElem) {
        if (!Array.isArray(arr)) return;

        const currentArr = arr.slice().reverse();

        //display pagination;
        paginationElem.classList.remove('d-none');

        let newsPerPage = 3;

        //prev-next
        let next = paginationElem.querySelectorAll('.page-item')[0],
            nextLink = next.querySelector('.page-link'),
            prev = paginationElem.querySelectorAll('.page-item')[1],
            prevLink = next.querySelector('.page-link');

        let currentPage = 0,
            arrWithPages = [],
            tempArr = [];


        for (let i = 0; i < currentArr.length; i++) {
            if (tempArr.length === newsPerPage) {
                arrWithPages.push(tempArr);
                tempArr = [];
            }
            tempArr.push(currentArr[i])
        }
        arrWithPages.push(tempArr);

        next.addEventListener('click', ()=> {
            if(currentPage === 0) return;
            currentPage--;
            displayNews();
            paginationDisableCheck();
        })

        prev.addEventListener('click', ()=> {
            if(currentPage === arrWithPages.length - 1) return;
            currentPage++;
            displayNews();
            paginationDisableCheck();
        })

        function paginationDisableCheck() {
            if(currentPage === 0) {
                next.classList.add('disabled');
                nextLink.setAttribute('tabindex', '-1');
                nextLink.setAttribute('aria-disabled', 'true');
            } else {
                next.classList.remove('disabled');
                nextLink.setAttribute('tabindex', '1');
                nextLink.setAttribute('aria-disabled', 'false');
            }
            if(currentPage === arrWithPages.length - 1) {
                prev.classList.add('disabled');
                prevLink.setAttribute('tabindex', '-1');
                prevLink.setAttribute('aria-disabled', 'true');
            } else {
                prev.classList.remove('disabled');
                prevLink.setAttribute('tabindex', '1');
                prevLink.setAttribute('aria-disabled', 'false');
            }
        }

        function displayNews() {
            let myArr = arrWithPages[currentPage].slice(),
               newsHTML = '';
            myArr.forEach(item=> {
                newsHTML += newsTemplate({
                    date: item.date,
                    title: item.title,
                    text: item.text,
                })
            })
            newsInner.innerHTML = newsHTML;
        }
        displayNews(arrWithPages[currentPage]);
        paginationDisableCheck();
    }

    //accordion auto add IDs (for bootstrap functionality)
    let accordion = document.querySelectorAll('.accordion');
    accordion.forEach((item, idx) => {

        let accordionHeader = item.querySelectorAll('.accordion-header'),
            accordionButton = item.querySelectorAll('.accordion-button'),
            accordionCollapse = item.querySelectorAll('.accordion-collapse');

        item.id = `accordion-${idx}`;

        accordionHeader.forEach((accHeader, accHeaderIdx) => {
            accHeader.id = `accordion-${idx}-heading-${accHeaderIdx}`;
        });

        accordionButton.forEach((accButton, accButtonIdx) => {
            accButton.setAttribute('data-bs-target', `#accordion-${idx}-item-${accButtonIdx}`);
        });

        accordionCollapse.forEach((accCollapse, accCollapseIdx) => {
            accCollapse.id = `accordion-${idx}-item-${accCollapseIdx}`;
            accCollapse.setAttribute('aria-labelledby', `accordion-${idx}-heading=${accCollapseIdx}`);
        });
    });


})()

