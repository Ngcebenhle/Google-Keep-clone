class Note {
    constructor(id, title, text) {
      this.id = id;
      this.title = title;
      this.text = text;
    }
  }
  
  class App {
    constructor() {
      // localStorage.setItem('test', JSON.stringify(['123']));
      // console.log(JSON.parse(localStorage.getItem('test')));
      // this.notes = JSON.parse(localStorage.getItem("notes")) || [];
      this.selectedNoteId = "";
      this.miniSidebar = true;

      this.notes = [];
  
      this.$activeForm = document.querySelector(".active-form");
      this.$inactiveForm = document.querySelector(".inactive-form");
      this.$noteTitle = document.querySelector("#note-title");
      this.$noteText = document.querySelector("#note-text");
      this.$notes = document.querySelector(".notes");
      this.$form = document.querySelector("#form");
      this.$modal = document.querySelector(".modal");
      this.$modalForm = document.querySelector("#modal-form");
      this.$modalTitle = document.querySelector("#modal-title");
      this.$modalText = document.querySelector("#modal-text");
      this.$closeModalForm = document.querySelector("#modal-btn");
      this.$sidebar = document.querySelector(".sidebar");
      this.$sidebarActiveItem = document.querySelector(".active-item");

      this.$note = document.querySelector(".note");
      ////////////////////////////////////////////////////////////////////
      this.$authDisplay = document.querySelector("#auth");
      this.$appDiplay = document.querySelector("#app");


      this.$appDiplay.style.display = "none"

      /////////////////////////////////////////////////////////////////////////
      this.$userDiplayName = document.querySelector(".auth-user");
      this.$logout = document.querySelector(".logout");
     
      
      // Initialize the FirebaseUI Widget using Firebase.
      this.ui = new firebaseui.auth.AuthUI(auth);

      this.handleAuth()

      this.addEventListeners();
      this.displayNotes();
    }

    //////////////////////////////////////////////////////////////////
    handleAuth(){

      firebase.auth().onAuthStateChanged((user) => {
        if (user) {

          this.redirectToApp()
          this.userId = user.uid;
          this.$userDiplayName.textContent = this.uid;
          
        } else {
          this.redirectToAuth()
        }
      });

    }

    redirectToApp(){
      this.$appDiplay.style.display = "block"
      this.$authDisplay.style.display = "none"
      this.noteReadHandler();
    }

    redirectToAuth(){

      this.$appDiplay.style.display = "none"
      this.$authDisplay.style.display = "block"

      this.ui.start('#auth', {
        signInOptions: [
          firebase.auth.EmailAuthProvider.PROVIDER_ID,
          firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        ],
        // Other config options...
      });
    }
    handleLogout(){
      auth.signOut().then(() => {
        this.redirectToAuth();
      }).catch((error) => {
        
      });
    }
  
    addEventListeners() {
      document.body.addEventListener("click", (event) => {
        this.handleFormClick(event);
        this.closeModal(event);
        this.openModal(event);
        this.handleArchiving(event);
      });
  
      this.$form.addEventListener("submit", (event) => {
        event.preventDefault();
        const title = this.$noteTitle.value;
        const text = this.$noteText.value;
        this.addNote({ title, text });
        this.closeActiveForm();
      });
  
      this.$modalForm.addEventListener("submit", (event) => {
        event.preventDefault();
      });
  
      this.$sidebar.addEventListener("mouseover", (event) => {
        this.handleToggleSidebar();
      });
  
      this.$sidebar.addEventListener("mouseout", (event) => {
        this.handleToggleSidebar();
      });

      this.$logout.addEventListener('click',(event) => {
        this.handleLogout();
      });

    }
  
    handleFormClick(event) {
      const isActiveFormClickedOn = this.$activeForm.contains(event.target);
      const isInactiveFormClickedOn = this.$inactiveForm.contains(event.target);
      const title = this.$noteTitle.value;
      const text = this.$noteText.value;
  
      if (isInactiveFormClickedOn) {
        this.openActiveForm();
      } else if (!isInactiveFormClickedOn && !isActiveFormClickedOn) {
        this.addNote({ title, text });
        this.closeActiveForm();
      }
    }
  
    openActiveForm() {
      this.$inactiveForm.style.display = "none";
      this.$activeForm.style.display = "block";
      this.$noteText.focus();
    }
  
    closeActiveForm() {
      this.$inactiveForm.style.display = "block";
      this.$activeForm.style.display = "none";
      this.$noteText.value = "";
      this.$noteTitle.value = "";
      this.saveNotes();
    }
  
    openModal(event) {
      const $selectedNote = event.target.closest(".note");
      if ($selectedNote && !event.target.closest(".archive")) {
        this.selectedNoteId = $selectedNote.id;
        this.$modalTitle.value = $selectedNote.children[1].innerHTML;
        this.$modalText.value = $selectedNote.children[2].innerHTML;
        this.$modal.classList.add("open-modal");
      } else {
        return;
      }
    }
  
    closeModal(event) {
      const isModalFormClickedOn = this.$modalForm.contains(event.target);
      const isCloseModalBtnClickedOn = this.$closeModalForm.contains(
        event.target
      );
      if (
        (!isModalFormClickedOn || isCloseModalBtnClickedOn) &&
        this.$modal.classList.contains("open-modal")
      ) {
        this.editNote(this.selectedNoteId, {
          title: this.$modalTitle.value,
          text: this.$modalText.value,
        });
        this.$modal.classList.remove("open-modal");
      }
    }
  
    handleArchiving(event) {
      const $selectedNote = event.target.closest(".note");
      if ($selectedNote && event.target.closest(".archive")) {
        this.selectedNoteId = $selectedNote.id;
        this.deleteNote(this.selectedNoteId);
      } else {
        return;
      }
    }
  
    addNote({ title, text }) {
      if (text != "") {
        const newNote = {id:cuid(), title, text};
        this.notes = [...this.notes, newNote];
        this.render();
        // this.displayNotes()
      }
    }
  
    editNote(id, { title, text }) {
      this.notes = this.notes.map((note) => {
        if (note.id == id) {
          note.title = title;
          note.text = text;
        }
        return note;
      });
      this.render();
    }
  
    handleMouseOverNote(element) {
      const $note = document.querySelector("#" + element.id);
      const $checkNote = $note.querySelector(".check-circle");
      const $noteFooter = $note.querySelector(".note-footer");
      $checkNote.style.visibility = "visible";
      $noteFooter.style.visibility = "visible";
    }
  
    handleMouseOutNote(element) {
      const $note = document.querySelector("#" + element.id);
      const $checkNote = $note.querySelector(".check-circle");
      const $noteFooter = $note.querySelector(".note-footer");
      $checkNote.style.visibility = "hidden";
      $noteFooter.style.visibility = "hidden";
    }
  
    handleToggleSidebar() {
      if (this.miniSidebar) {
        this.$sidebar.style.width = "250px";
        this.$sidebar.classList.add("sidebar-hover");
        this.$sidebarActiveItem.classList.add("sidebar-active-item");
        this.miniSidebar = false;
      } else {
        this.$sidebar.style.width = "80px";
        this.$sidebar.classList.remove("sidebar-hover");
        this.$sidebarActiveItem.classList.remove("sidebar-active-item");
        this.miniSidebar = true;
      }
    }
  
    noteReadHandler(){
      var docRef = db.collection("Notes").doc(this.userId);

        docRef.get().then((doc) => {
            if (doc.exists) {
                // console.log("Document data:", doc.data());
                this.notes = doc.data().notes
                this.displayNotes();
            } else {
                // doc.data() will be undefined in this case
                console.log("No such document!");

                        // Add a new document in collection "cities"
                db.collection("Notes").doc(this.userId).set({  
                  notes: []    
                })
                .then(() => {
                  console.log("User successfully Created!");
                })
                .catch((error) => {
                  console.error("Error writing document: ", error);
                });

            }

        }).catch((error) => {
            console.log("Error getting document:", error);
        });
    }

    saveNotes() {
      // localStorage.setItem('notes', JSON.stringify(this.notes));

      
        // Add a new document in collection "cities"
        db.collection("Notes").doc(this.userId).set({  
          notes: this.notes    
        })
        .then(() => {
          console.log("Document successfully written!");
        })
        .catch((error) => {
          console.error("Error writing document: ", error);
        });
    }
  
    render() {
      this.saveNotes();
      this.displayNotes();
    }
  
  //  onmouseover="app.handleMouseOverNote(this)" onmouseout="app.handleMouseOutNote(this)"
  
    displayNotes() {
      this.$notes.innerHTML = this.notes.map((note) =>
            `
          <div class="note" id="${note.id}" onmouseover="app.handleMouseOverNote(this)" 
          onmouseout="app.handleMouseOutNote(this)">
            <span class="material-symbols-outlined check-circle"
              >check_circle</span
            >
            <div class="title">${note.title}</div>
            <div class="text">${note.text}</div>
            <div class="note-footer">
              <div class="tooltip">
                <span class="material-symbols-outlined hover small-icon"
                  >add_alert</span
                >
                <span class="tooltip-text">Remind me</span>
              </div>
              <div class="tooltip">
                <span class="material-symbols-outlined hover small-icon"
                  >person_add</span
                >
                <span class="tooltip-text">Collaborator</span>
              </div>
              <div class="tooltip">
                <span class="material-symbols-outlined hover small-icon"
                  >palette</span
                >
                <span class="tooltip-text">Change Color</span>
              </div>
              <div class="tooltip">
                <span class="material-symbols-outlined hover small-icon"
                  >image</span
                >
                <span class="tooltip-text">Add Image</span>
              </div>
              <div class="tooltip archive">
                <span class="material-symbols-outlined hover small-icon"
                  >archive</span
                >
                <span class="tooltip-text">Archive</span>
              </div>
              <div class="tooltip">
                <span class="material-symbols-outlined hover small-icon"
                  >more_vert</span
                >
                <span class="tooltip-text">More</span>
              </div>
            </div>
          </div>
          `
        )
        .join("");
    }
  
    deleteNote(id) {
      this.notes = this.notes.filter((note) => note.id != id);
      this.render();
    }
  }
  
  const app = new App();