package com.mycompany.myapp.repository.search;

import co.elastic.clients.elasticsearch._types.query_dsl.QueryStringQuery;
import com.mycompany.myapp.domain.Libro;
import com.mycompany.myapp.repository.LibroRepository;
import java.util.stream.Stream;
import org.springframework.data.elasticsearch.client.elc.ElasticsearchTemplate;
import org.springframework.data.elasticsearch.client.elc.NativeQuery;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.query.Query;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.scheduling.annotation.Async;

/**
 * Spring Data Elasticsearch repository for the {@link Libro} entity.
 */
public interface LibroSearchRepository extends ElasticsearchRepository<Libro, Long>, LibroSearchRepositoryInternal {}

interface LibroSearchRepositoryInternal {
    Stream<Libro> search(String query);

    Stream<Libro> search(Query query);

    @Async
    void index(Libro entity);

    @Async
    void deleteFromIndexById(Long id);
}

class LibroSearchRepositoryInternalImpl implements LibroSearchRepositoryInternal {

    private final ElasticsearchTemplate elasticsearchTemplate;
    private final LibroRepository repository;

    LibroSearchRepositoryInternalImpl(ElasticsearchTemplate elasticsearchTemplate, LibroRepository repository) {
        this.elasticsearchTemplate = elasticsearchTemplate;
        this.repository = repository;
    }

    @Override
    public Stream<Libro> search(String query) {
        NativeQuery nativeQuery = new NativeQuery(QueryStringQuery.of(qs -> qs.query(query))._toQuery());
        return search(nativeQuery);
    }

    @Override
    public Stream<Libro> search(Query query) {
        return elasticsearchTemplate.search(query, Libro.class).map(SearchHit::getContent).stream();
    }

    @Override
    public void index(Libro entity) {
        repository.findOneWithEagerRelationships(entity.getId()).ifPresent(elasticsearchTemplate::save);
    }

    @Override
    public void deleteFromIndexById(Long id) {
        elasticsearchTemplate.delete(String.valueOf(id), Libro.class);
    }
}
