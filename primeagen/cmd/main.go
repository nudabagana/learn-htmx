package main

import (
	"html/template"
	"io"
	"strconv"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

type Templates struct {
	templates *template.Template
}

func (t *Templates) Render(w io.Writer, name string, data interface{}, c echo.Context) error {
	return t.templates.ExecuteTemplate(w, name, data)
}

func newTemplate() *Templates {
	return &Templates{
		templates: template.Must(template.ParseGlob("views/*.html")),
	}
}

var id = 0

type Contact struct {
	Name  string
	Email string
	Id    int
}

func nextId() int {
	id++
	return id
}

type Contacts = []Contact

type Data struct {
	Contacts Contacts
}

func (d Data) hasEmail(email string) bool {
	for _, contact := range d.Contacts {
		if contact.Email == email {
			return true
		}
	}
	return false
}

func (d Data) indexOf(id int) int {
	for i, contact := range d.Contacts {
		if contact.Id == id {
			return i
		}
	}
	return -1
}

func newData() Data {
	return Data{
		Contacts: []Contact{
			{
				Name:  "John",
				Email: "jd@gmail.com",
				Id:    nextId(),
			},
			{
				Name:  "Clara",
				Email: "cd@gmail.com",
				Id:    nextId(),
			},
		},
	}
}

type FormData struct {
	Values map[string]string
	Errors map[string]string
}

type Page struct {
	Data Data
	Form FormData
}

func main() {

	e := echo.New()
	e.Use(middleware.Logger())

	e.Renderer = newTemplate()

	e.Static("/images", "images")
	e.Static("/css", "css")

	page := Page{
		Data: newData(),
		Form: FormData{
			Values: map[string]string{},
			Errors: map[string]string{},
		},
	}

	e.GET("/", func(c echo.Context) error {
		return c.Render(200, "index", page)
	})

	e.POST("/contacts", func(c echo.Context) error {
		name := c.FormValue("name")
		email := c.FormValue("email")

		if page.Data.hasEmail(email) {
			formData := FormData{
				Values: map[string]string{},
				Errors: map[string]string{},
			}
			formData.Values["name"] = name
			formData.Values["email"] = email
			formData.Errors["email"] = "Email already exists"

			return c.Render(422, "form", formData)
		}

		contact := Contact{Name: name, Email: email, Id: nextId()}
		page.Data.Contacts = append(page.Data.Contacts, contact)

		c.Render(200, "form", FormData{
			Values: map[string]string{},
			Errors: map[string]string{},
		})
		return c.Render(200, "oob-contact", contact)
	})

	e.DELETE("/contacts/:id", func(c echo.Context) error {
		time.Sleep(3 * time.Second)
		idStr := c.Param("id")
		id, err := strconv.Atoi(idStr)
		if err != nil {
			return c.String(400, "Invalid id")
		}
		index := page.Data.indexOf(id)
		if index == -1 {
			return c.String(404, "Contact nof found")
		}
		if len(page.Data.Contacts) <= 1 {
			page.Data.Contacts = []Contact{}
		} else {
			page.Data.Contacts = append(page.Data.Contacts[:index], page.Data.Contacts[index+1])
		}

		return c.NoContent(200)
	})

	e.Logger.Fatal(e.Start("localhost:3000"))
}
