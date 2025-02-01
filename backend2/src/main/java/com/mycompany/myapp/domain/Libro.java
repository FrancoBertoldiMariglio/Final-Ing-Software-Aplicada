package com.mycompany.myapp.domain;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

/**
 * A Libro.
 */
@Entity
@Table(name = "libro")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@org.springframework.data.elasticsearch.annotations.Document(indexName = "libro")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Libro implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "isbn")
    @org.springframework.data.elasticsearch.annotations.Field(type = org.springframework.data.elasticsearch.annotations.FieldType.Integer)
    private Integer isbn;

    @Column(name = "precio")
    private Float precio;

    @Column(name = "nombre_autor")
    @org.springframework.data.elasticsearch.annotations.Field(type = org.springframework.data.elasticsearch.annotations.FieldType.Text)
    private String nombreAutor;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "rel_libro__users", joinColumns = @JoinColumn(name = "libro_id"), inverseJoinColumns = @JoinColumn(name = "users_id"))
    @Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
    private Set<User> users = new HashSet<>();

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public Libro id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getIsbn() {
        return this.isbn;
    }

    public Libro isbn(Integer isbn) {
        this.setIsbn(isbn);
        return this;
    }

    public void setIsbn(Integer isbn) {
        this.isbn = isbn;
    }

    public Float getPrecio() {
        return this.precio;
    }

    public Libro precio(Float precio) {
        this.setPrecio(precio);
        return this;
    }

    public void setPrecio(Float precio) {
        this.precio = precio;
    }

    public String getNombreAutor() {
        return this.nombreAutor;
    }

    public Libro nombreAutor(String nombreAutor) {
        this.setNombreAutor(nombreAutor);
        return this;
    }

    public void setNombreAutor(String nombreAutor) {
        this.nombreAutor = nombreAutor;
    }

    public Set<User> getUsers() {
        return this.users;
    }

    public void setUsers(Set<User> users) {
        this.users = users;
    }

    public Libro users(Set<User> users) {
        this.setUsers(users);
        return this;
    }

    public Libro addUsers(User user) {
        this.users.add(user);
        return this;
    }

    public Libro removeUsers(User user) {
        this.users.remove(user);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Libro)) {
            return false;
        }
        return getId() != null && getId().equals(((Libro) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Libro{" +
            "id=" + getId() +
            ", isbn=" + getIsbn() +
            ", precio=" + getPrecio() +
            ", nombreAutor='" + getNombreAutor() + "'" +
            "}";
    }
}
