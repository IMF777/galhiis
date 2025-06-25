/*data.forEach((item) => {
    const topic = document.createElement("div")
    topic.classList.add("topic")
    const title = document.createElement("div")
    title.classList.add("title")
    title.innerHTML = item.topic
    title.add
    topic.appendChild(title)

    const scrollto = document.createElement("div")
    scrollto.classList.add("scrollto")
    scrollto.innerHTML = data.indexOf(item) + 1;
    document.getElementById("nav").appendChild(scrollto);
    scrollto.addEventListener("click", () => {
        topic.scrollIntoView({ behavior: "smooth" })
    })

    var text = item.content
    var content = document.createElement("div")
    content.classList.add("content")
    text.forEach((item) => {
        const question = document.createElement("div")
        question.classList.add("question")
        question.innerHTML = item.question
        content.appendChild(question)
        const answer = document.createElement("div")
        answer.classList.add("answer")
        answer.innerHTML = item.answer
        content.appendChild(answer)
    })
    topic.appendChild(content)
    document.querySelector(".app").appendChild(topic)
})*/

// Assuming you already have a "translation" array with the same structure and order as "data"

// Create the overlay element
const overlay = document.createElement("div")
overlay.id = "overlay"
overlay.classList.add("hide")
document.body.appendChild(overlay)

// Create the translation box
const translationBox = document.createElement("div")
translationBox.id = "translation-box"
translationBox.classList.add("hide")
document.body.appendChild(translationBox)


// Function to show translation
function showTranslation(topicIndex, contentIndex = null) {
    overlay.classList.remove("hide")
    overlay.classList.add("fade-in")

    translationBox.classList.remove("hide")
    translationBox.classList.add("fade-in")

    if (contentIndex === null) {
        // Show the whole topic if the title is clicked
        translationBox.innerHTML = `<h2>${translation[topicIndex].topic}</h2>`
    } else {
        // Show the specific question and answer
        translationBox.innerHTML = `
            <h3>${translation[topicIndex].content[contentIndex].question}</h3>
            <div>${translation[topicIndex].content[contentIndex].answer}</div>
        `
    }
}
overlay.addEventListener("click", () => {
    if (!translationBox.classList.contains("hide")) {
        overlay.classList.remove("fade-in")
        overlay.classList.add("fade-out")

        translationBox.classList.remove("fade-in")
        translationBox.classList.add("fade-out")

        setTimeout(() => {
            overlay.classList.remove("fade-out")
            overlay.classList.add("hide")

            translationBox.classList.remove("fade-out")
            translationBox.classList.add("hide")

            translationBox.innerHTML = ''
        }, 300) // duration matches CSS fade-out
    }
})


// Close translation box when clicking anywhere outside
document.addEventListener("click", (e) => {
    if (!translationBox.contains(e.target)) {
        if (!translationBox.classList.contains("hide")) {
            translationBox.classList.remove("fade-in")
            translationBox.classList.add("fade-out")
            setTimeout(() => {
                translationBox.classList.remove("fade-out")
                translationBox.classList.add("hide")
                translationBox.innerHTML = ''
            }, 300) // duration matches CSS fade-out
        }
    }
})

// Modify your existing loop to add click listeners:
data.forEach((item, topicIndex) => {
    const topic = document.createElement("div")
    topic.classList.add("topic")

    const title = document.createElement("div")
    title.classList.add("title")
    title.innerHTML = item.topic
    topic.appendChild(title)

    title.addEventListener("click", (e) => {
        e.stopPropagation()
        showTranslation(topicIndex)
    })

    const scrollto = document.createElement("div")
    scrollto.classList.add("scrollto")
    scrollto.innerHTML = data.indexOf(item) + 1
    document.getElementById("nav").appendChild(scrollto)
    scrollto.addEventListener("click", () => {
        topic.scrollIntoView({ behavior: "smooth" })
    })

    var text = item.content
    var content = document.createElement("div")
    content.classList.add("content")

    text.forEach((subItem, contentIndex) => {
        const question = document.createElement("div")
        question.classList.add("question")
        question.innerHTML = subItem.question
        question.addEventListener("click", (e) => {
            e.stopPropagation()
            showTranslation(topicIndex, contentIndex)
        })
        content.appendChild(question)

        const answer = document.createElement("div")
        answer.classList.add("answer")
        answer.innerHTML = subItem.answer
        answer.addEventListener("click", (e) => {
            e.stopPropagation()
            showTranslation(topicIndex, contentIndex)
        })
        content.appendChild(answer)
    })
    topic.appendChild(content)
    document.querySelector(".app").appendChild(topic)
})
